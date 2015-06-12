/**
 * The contents of this file are subject to the terms of the Common Development and
 * Distribution License (the License). You may not use this file except in compliance with the
 * License.
 *
 * You can obtain a copy of the License at legal/CDDLv1.0.txt. See the License for the
 * specific language governing permission and limitations under the License.
 *
 * When distributing Covered Software, include this CDDL Header Notice in each file and include
 * the License file at legal/CDDLv1.0.txt. If applicable, add the following below the CDDL
 * Header, with the fields enclosed by brackets [] replaced by your own identifying
 * information: "Portions copyright [year] [name of copyright owner]".
 *
 * Copyright 2014 - 2015 ForgeRock AS.
 */

#include "platform.h"
#include "am.h"
#include "utility.h"
#include "list.h"

struct mem_chunk {
    size_t size;
    size_t usize;
    char used;
    struct offset_list lh;
};
#define SIZEOF_mem_chunk (sizeof(struct mem_chunk))

struct mem_pool {
    size_t size;
    size_t user_offset;
    int open;
    int resize;
    struct offset_list lh; /*first, last*/
};
#define SIZEOF_mem_pool (sizeof(struct mem_pool))

#define AM_ALIGNMENT 8
#define AM_ALIGN(size) (((size) + (AM_ALIGNMENT-1)) & ~(AM_ALIGNMENT-1))

int am_shm_lock(am_shm_t *am) {
    struct mem_pool *pool;
    int rv = AM_SUCCESS;

    /* once we enter the critical section, check if any other process hasn't 
     * re-mapped our segment somewhere else (compare local_size to global_size which
     * will differ after successful am_shm_resize)
     */

#ifdef _WIN32
    do {
        am->error = WaitForSingleObject(am->h[0], INFINITE);
    } while (am->error == WAIT_ABANDONED);

    if (am->local_size != *(am->global_size)) {
        if (UnmapViewOfFile(am->pool) == 0) {
            am->error = GetLastError();
            return AM_EFAULT;
        }
        if (CloseHandle(am->h[2]) == 0) {
            am->error = GetLastError();
            return AM_EFAULT;
        }
        am->h[2] = CreateFileMappingA(am->h[1], NULL, PAGE_READWRITE, 0, (DWORD) *(am->global_size), NULL);
        am->error = GetLastError();
        if (am->h[2] == NULL) {
            return AM_EFAULT;
        }
        am->pool = (struct mem_pool *) MapViewOfFile(am->h[2], FILE_MAP_ALL_ACCESS, 0, 0, 0);
        am->error = GetLastError();
        if (am->pool == NULL || (am->error != 0 && am->error != ERROR_ALREADY_EXISTS)) {
            return AM_EFAULT;
        }

        pool = (struct mem_pool *) am->pool;
        am->local_size = *(am->global_size);
        if (pool->user_offset > 0) {
            am->user = AM_GET_POINTER(pool, pool->user_offset);
        }
    }

#else
    pthread_mutex_t *lock = (pthread_mutex_t *) am->lock;
    am->error = pthread_mutex_lock(lock);
#if !defined(__APPLE__) && !defined(AIX)
    if (am->error == EOWNERDEAD) {
        am->error = pthread_mutex_consistent_np(lock);
    }
#endif
    if (am->local_size != *(am->global_size)) {
        am->error = munmap(am->pool, am->local_size);
        if (am->error == -1) {
            am->error = errno;
            rv = AM_EFAULT;
        }
        am->pool = mmap(NULL, *(am->global_size), PROT_READ | PROT_WRITE, MAP_SHARED, am->fd, 0);
        if (am->pool == MAP_FAILED) {
            am->error = errno;
            rv = AM_EFAULT;
        }

        pool = (struct mem_pool *) am->pool;
        am->local_size = *(am->global_size);
        if (pool->user_offset > 0) {
            am->user = AM_GET_POINTER(pool, pool->user_offset);
        }
    }
#endif
    return rv;
}

void am_shm_unlock(am_shm_t *am) {
#ifdef _WIN32
    ReleaseMutex(am->h[0]);
#else
    pthread_mutex_t *lock = (pthread_mutex_t *) am->lock;
    pthread_mutex_unlock(lock);
#endif
}

void am_shm_shutdown(am_shm_t *am) {
    int open = -1;
    size_t size = 0;

    if (am == NULL || am_shm_lock(am) != AM_SUCCESS) {
        return;
    }

    size = ((struct mem_pool *) am->pool)->size;
    open = --(((struct mem_pool *) am->pool)->open);
    am_shm_unlock(am);
#ifdef _WIN32
    if (am->pool != NULL) {
        UnmapViewOfFile(am->pool);
    }
    if (am->h[2] != NULL) {
        CloseHandle(am->h[2]);
    }
    if (am->h[0] != NULL) {
        ReleaseMutex(am->h[0]);
        CloseHandle(am->h[0]);
    }
    if (am->h[1] != INVALID_HANDLE_VALUE) {
        CloseHandle(am->h[1]);
    }

    if (am->global_size != NULL) {
        UnmapViewOfFile(am->global_size);
    }
    if (am->h[3] != NULL) {
        CloseHandle(am->h[3]);
    }
    if (open == 0) {
        DeleteFile(am->name[2]);
    }
#else
    if (am->pool != NULL) {
        munmap(am->pool, size);
    }
    if (am->fd != -1) {
        close(am->fd);
    }
    if (open == 0) {
        shm_unlink(am->name[1]);
        munmap(am->lock, sizeof (pthread_mutex_t));
        munmap(am->global_size, sizeof (size_t));
    }
#endif
    free(am);
    am = NULL;
}

void am_shm_set_user_offset(am_shm_t *am, size_t off) {
    if (am != NULL && am->pool != NULL) {
        ((struct mem_pool *) am->pool)->user_offset = off;
    }
}

am_shm_t *am_shm_create(const char *name, size_t usize) {
    struct mem_pool *pool = NULL;
    size_t size;
    char opened = AM_FALSE;
    void *area = NULL;
    am_shm_t *ret = NULL;
#ifdef _WIN32
    char dll_path[AM_URI_SIZE];
    DWORD error = 0;
    HMODULE hm = NULL;
    void *caller = _ReturnAddress();
#else
    int fdflags;
    int error = 0;
#endif

    ret = calloc(1, sizeof (am_shm_t));
    if (ret == NULL) return NULL;

#ifdef _WIN32
    if (GetModuleHandleExA(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS |
            GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT, (LPCSTR) caller, &hm) &&
            GetModuleFileNameA(hm, dll_path, sizeof (dll_path) - 1) > 0) {
        PathRemoveFileSpecA(dll_path);
        strcat(dll_path, FILE_PATH_SEP);
        snprintf(ret->name[0], sizeof (ret->name[0]),
                AM_GLOBAL_PREFIX"%s_l", name); /*mutex/semaphore*/
        snprintf(ret->name[1], sizeof (ret->name[1]),
                AM_GLOBAL_PREFIX"%s_s", name); /*shared memory name*/
        snprintf(ret->name[2], sizeof (ret->name[2]),
                "%s.."FILE_PATH_SEP"log"FILE_PATH_SEP"%s_f", dll_path, name); /*shared memory file name*/
        snprintf(ret->name[3], sizeof (ret->name[3]),
                AM_GLOBAL_PREFIX"%s_sz", name); /*shared memory name for global_size*/
    } else {
        ret->error = AM_NOT_FOUND;
        return ret;
    }
#else
    snprintf(ret->name[0], sizeof (ret->name[0]),
            "/%s_l", name); /*mutex/semaphore*/
    snprintf(ret->name[1], sizeof (ret->name[1]),
#ifdef __sun
            "/%s_s"
#else
            "%s_s"
#endif
            , name); /*shared memory name*/
#endif

    size = page_size(usize + SIZEOF_mem_pool); /*need at least the size of the mem_pool header*/

#ifdef _WIN32
    ret->h[0] = CreateMutexA(NULL, TRUE, ret->name[0]);
    error = GetLastError();
    if (ret->h[0] != NULL && error == ERROR_ALREADY_EXISTS) {
        do {
            error = WaitForSingleObject(ret->h[0], INFINITE);
        } while (error == WAIT_ABANDONED);
    } else {
        if (error == ERROR_ACCESS_DENIED) {
            ret->h[0] = OpenMutexA(SYNCHRONIZE, FALSE, ret->name[0]);
        }
        if (ret->h[0] == NULL) {
            ret->error = error;
            return ret;
        }
    }

    ret->h[1] = CreateFileA(ret->name[2], GENERIC_WRITE | GENERIC_READ,
            FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
            NULL, CREATE_NEW, FILE_FLAG_WRITE_THROUGH | FILE_FLAG_NO_BUFFERING, NULL);
    error = GetLastError();
    if (ret->h[1] == INVALID_HANDLE_VALUE && error == ERROR_FILE_EXISTS) {
        ret->h[1] = CreateFileA(ret->name[2], GENERIC_WRITE | GENERIC_READ,
                FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
                NULL, OPEN_EXISTING, FILE_FLAG_WRITE_THROUGH | FILE_FLAG_NO_BUFFERING, NULL);
        error = GetLastError();
        if (ret->h[1] != INVALID_HANDLE_VALUE) {
            opened = AM_TRUE;
            size = GetFileSize(ret->h[1], NULL);
        }
    }

    if (ret->h[1] == INVALID_HANDLE_VALUE || error != 0) {
        CloseHandle(ret->h[0]);
        ret->error = error;
        am_shm_unlock(ret);
        return ret;
    }

    if (!opened) {
        ret->h[2] = CreateFileMappingA(ret->h[1], NULL, PAGE_READWRITE, 0, (DWORD) size, ret->name[1]);
        error = GetLastError();
    } else {
        ret->h[2] = OpenFileMappingA(FILE_MAP_READ | FILE_MAP_WRITE, FALSE, ret->name[1]);
        error = GetLastError();
        if (ret->h[2] == NULL && error == ERROR_FILE_NOT_FOUND) {
            ret->h[2] = CreateFileMappingA(ret->h[1], NULL, PAGE_READWRITE, 0, (DWORD) size, ret->name[1]);
            error = GetLastError();
        }
    }

    if (ret->h[2] == NULL || error != 0) {
        CloseHandle(ret->h[0]);
        CloseHandle(ret->h[1]);
        ret->error = error;
        am_shm_unlock(ret);
        return ret;
    }

    area = MapViewOfFile(ret->h[2], FILE_MAP_ALL_ACCESS, 0, 0, 0);
    error = GetLastError();
    if (area == NULL || (error != 0 && error != ERROR_ALREADY_EXISTS)) {
        CloseHandle(ret->h[0]);
        CloseHandle(ret->h[1]);
        CloseHandle(ret->h[2]);
        ret->error = error;
        am_shm_unlock(ret);
        return ret;
    }

    ret->h[3] = CreateFileMappingA(INVALID_HANDLE_VALUE, NULL, PAGE_READWRITE, 0, (DWORD) sizeof (size_t), ret->name[3]);
    if (ret->h[3] == NULL) {
        ret->error = GetLastError();
        CloseHandle(ret->h[0]);
        CloseHandle(ret->h[1]);
        CloseHandle(ret->h[2]);
        am_shm_unlock(ret);
        return ret;
    }
    ret->global_size = MapViewOfFile(ret->h[3], FILE_MAP_ALL_ACCESS, 0, 0, 0);
    if (ret->global_size == NULL) {
        ret->error = GetLastError();
        CloseHandle(ret->h[0]);
        CloseHandle(ret->h[1]);
        CloseHandle(ret->h[2]);
        CloseHandle(ret->h[3]);
        am_shm_unlock(ret);
        return ret;
    }
    *(ret->global_size) = ret->local_size = size;

#else

    ret->lock = mmap(NULL, sizeof (pthread_mutex_t),
            PROT_READ | PROT_WRITE, MAP_SHARED | MAP_ANON, -1, 0);
    if (ret->lock == MAP_FAILED) {
        ret->error = errno;
        return ret;
    } else {
        pthread_mutexattr_t attr;
        pthread_mutex_t *lock = (pthread_mutex_t *) ret->lock;
        pthread_mutexattr_init(&attr);
        pthread_mutexattr_setpshared(&attr, PTHREAD_PROCESS_SHARED);
        pthread_mutexattr_settype(&attr, PTHREAD_MUTEX_RECURSIVE);
#if defined(__sun)
#if defined(__SunOS_5_10) 
#if defined(_POSIX_THREAD_PRIO_INHERIT)
        pthread_mutexattr_setprotocol(&attr, PTHREAD_PRIO_INHERIT);
        pthread_mutexattr_setrobust_np(&attr, PTHREAD_MUTEX_ROBUST_NP);
#endif
#else
        pthread_mutexattr_setrobust(&attr, PTHREAD_MUTEX_ROBUST);
#endif
#endif
#if defined(LINUX)
        pthread_mutexattr_setrobust_np(&attr, PTHREAD_MUTEX_ROBUST_NP);
#endif
        pthread_mutex_init(lock, &attr);
        pthread_mutexattr_destroy(&attr);
    }

    ret->global_size = mmap(NULL, sizeof (size_t),
            PROT_READ | PROT_WRITE, MAP_SHARED | MAP_ANON, -1, 0);
    if (ret->global_size == MAP_FAILED) {
        ret->error = errno;
        return ret;
    }

    *(ret->global_size) = ret->local_size = size;

    am_shm_lock(ret);

    ret->fd = shm_open(ret->name[1], O_CREAT | O_EXCL | O_RDWR, 0666);
    error = errno;
    if (ret->fd == -1 && error != EEXIST) {
        munmap(ret->lock, sizeof (pthread_mutex_t));
        ret->error = error;
        am_shm_unlock(ret);
        return ret;
    }
    if (ret->fd == -1) {
        ret->fd = shm_open(ret->name[1], O_RDWR, 0666);
        error = errno;
        if (ret->fd == -1) {
            munmap(ret->lock, sizeof (pthread_mutex_t));
            ret->error = error;
            am_shm_unlock(ret);
            return ret;
        }
        /* reset FD_CLOEXEC */
        fdflags = fcntl(ret->fd, F_GETFD);
        fdflags &= ~FD_CLOEXEC;
        fcntl(ret->fd, F_SETFD, fdflags);
        /* try with just a header */
        area = mmap(NULL, SIZEOF_mem_pool, PROT_READ | PROT_WRITE, MAP_SHARED, ret->fd, 0);
        if (area == MAP_FAILED) {
            ret->error = errno;
            am_shm_unlock(ret);
            return ret;
        }
        size = ((struct mem_pool *) area)->size;
        if (munmap(area, SIZEOF_mem_pool) == -1) {
            ret->error = errno;
            am_shm_unlock(ret);
            return ret;
        }
        area = mmap(NULL, size, PROT_READ | PROT_WRITE, MAP_SHARED, ret->fd, 0);
        if (area == MAP_FAILED) {
            ret->error = errno;
            am_shm_unlock(ret);
            return ret;
        }
        opened = AM_TRUE;
    } else {
        /* reset FD_CLOEXEC */
        fdflags = fcntl(ret->fd, F_GETFD);
        fdflags &= ~FD_CLOEXEC;
        fcntl(ret->fd, F_SETFD, fdflags);
        if (ftruncate(ret->fd, size) == -1) {
            ret->error = errno;
            am_shm_unlock(ret);
            return ret;
        }
        area = mmap(NULL, size, PROT_READ | PROT_WRITE, MAP_SHARED, ret->fd, 0);
        if (area == MAP_FAILED) {
            ret->error = errno;
            am_shm_unlock(ret);
            return ret;
        }
    }

#endif

    ret->init = !opened;

    pool = (struct mem_pool *) area;
    if (ret->init) {
        struct mem_chunk *e = (struct mem_chunk *) ((char *) pool + SIZEOF_mem_pool);
        pool->size = size;
        pool->user_offset = 0;
        pool->open = 1;
        pool->resize = 0;

        /* add all available (free) space as one chunk in a freelist */
        e->used = 0;
        e->usize = 0;
        e->size = pool->size - SIZEOF_mem_pool;
        e->lh.next = e->lh.prev = 0;
        /* update head prev/next pointers */
        pool->lh.next = pool->lh.prev = AM_GET_OFFSET(pool, e);
    } else {
        if (pool->user_offset > 0) {
            ret->user = AM_GET_POINTER(pool, pool->user_offset);
        }
        pool->open++;
    }

    ret->pool = pool;
    ret->error = 0;
    am_shm_unlock(ret);
    return ret;
}

#ifdef _WIN32

static BOOL resize_file(HANDLE file, size_t new_size) {
    DWORD end_size, start_size = GetFileSize(file, NULL);
    DWORD dwp = SetFilePointer(file, (LONG) new_size, NULL, FILE_BEGIN);
    DWORD err = GetLastError();
    if (dwp != INVALID_SET_FILE_POINTER) {
        err = SetEndOfFile(file);
        if (err == 0) {
            err = GetLastError();
        }
        err = SetFileValidData(file, new_size);
    }
    end_size = GetFileSize(file, NULL);
    return (start_size != INVALID_FILE_SIZE && end_size != INVALID_FILE_SIZE);
}

#endif

static int am_shm_extend(am_shm_t *am, size_t usize) {
    size_t size, osize;
    int rv = AM_SUCCESS;

    if (usize == 0 || am == NULL || am->pool == NULL) {
        return AM_EINVAL;
    }

    size = page_size(usize + SIZEOF_mem_pool);

#ifdef _WIN32    
    if (UnmapViewOfFile(am->pool) == 0) {
        am->error = GetLastError();
        return AM_ERROR;
    }
    if (CloseHandle(am->h[2]) == 0) {
        am->error = GetLastError();
        return AM_ERROR;
    }
    if (resize_file(am->h[1], size) == FALSE) {
        return AM_ERROR;
    }
    am->h[2] = CreateFileMappingA(am->h[1], NULL, PAGE_READWRITE, 0, (DWORD) size, NULL);
    am->error = GetLastError();
    if (am->h[2] == NULL) {
        return AM_ERROR;
    }
    am->pool = (struct mem_pool *) MapViewOfFile(am->h[2], FILE_MAP_ALL_ACCESS, 0, 0, 0);
    am->error = GetLastError();
    if (am->pool == NULL || (am->error != 0 && am->error != ERROR_ALREADY_EXISTS)) {
        rv = AM_ERROR;
    } else
#else
    osize = ((struct mem_pool *) am->pool)->size;
    rv = ftruncate(am->fd, size);
    if (rv == -1) {
        am->error = errno;
        return AM_EINVAL;
    }
    munmap(am->pool, osize);
    am->pool = mmap(NULL, size, PROT_READ | PROT_WRITE, MAP_SHARED, am->fd, 0);
    if (am->pool == MAP_FAILED) {
        am->error = errno;
        rv = AM_ERROR;
    } else
#endif
    {
        struct mem_pool *pool = (struct mem_pool *) am->pool;
        struct mem_chunk *last = (struct mem_chunk *) AM_GET_POINTER(pool, pool->lh.next);

        if (last == NULL) {
            am->error = AM_ENOMEM;
            return AM_ERROR;
        }

        if (last->used == 0) {
            /* the last chunk is not used - add all newly allocated space there */
            last->size += size - pool->size;
        } else {
            /* the last chunk is used - add all newly allocated space right after the last chunk 
             * adjusting both - next pointer of the last chunk and head node to point to it
             */
            struct mem_chunk *e = (struct mem_chunk *) ((char *) pool + pool->size);
            e->used = 0;
            e->usize = 0;
            e->size = size - pool->size;
            e->lh.prev = AM_GET_OFFSET(pool, last);
            e->lh.next = 0;
            pool->lh.next = last->lh.next = AM_GET_OFFSET(pool, e);
        }

        *(am->global_size) = am->local_size = pool->size = size; /*new size*/
        am->error = AM_SUCCESS;
    }
    return rv;
}

void *am_shm_alloc(am_shm_t *am, size_t usize) {
    struct mem_pool *pool;
    struct mem_chunk *e, *t, *n, *head, *cmin = NULL;
    void *ret = NULL;
    size_t size, smin, s;

    if (usize == 0 || am == NULL ||
            am->pool == NULL || am_shm_lock(am) != AM_SUCCESS) {
        return NULL;
    }

    pool = (struct mem_pool *) am->pool;
    size = AM_ALIGN(usize + SIZEOF_mem_chunk);
    head = (struct mem_chunk *) AM_GET_POINTER(pool, pool->lh.prev);

    /* find the first-fitting chunk */
    smin = pool->size;

    AM_OFFSET_LIST_FOR_EACH(pool, head, e, t, struct mem_chunk) {
        if (e->used == 0) {
            s = e->size;
            if (s >= size && s < smin) {
                cmin = e;
                smin = s;
#ifdef AM_SHARED_BEST_FIT
                if (s == size)
#endif
                    break;
            }
        }
        if (e->lh.next == 0) break;
    }

    if (cmin != NULL) {
        if (cmin->size > (size + MIN(2 * size, SIZEOF_mem_chunk))) {
            /* split chunk */
            s = cmin->size - size;
            cmin->size = size;
            cmin->usize = usize;
            cmin->used = 1;
            ret = (void *) ((char *) cmin + SIZEOF_mem_chunk);

            /* add remaining part as a free chunk */
            n = (struct mem_chunk *) ((char *) cmin + size);
            n->used = 0;
            n->size = s;
            n->usize = 0;
            n->lh.prev = n->lh.next = cmin->lh.next;

            /* adjust prev-next values for sibling chunks */
            cmin->lh.next = AM_GET_OFFSET(pool, n);
            n->lh.prev = AM_GET_OFFSET(pool, cmin);
            if (n->lh.next == 0) {
                /* in case we are splitting off the last or only chunk - adjust head-next value */
                pool->lh.next = cmin->lh.next;
            } else {
                ((struct mem_chunk *) AM_GET_POINTER(pool, n->lh.next))->lh.prev = cmin->lh.next;
            }
        } else if (cmin->size >= size) {
            /* can't split anything out - use all of it */
            cmin->used = 1;
            cmin->usize = usize;
            ret = (void *) ((char *) cmin + SIZEOF_mem_chunk);
        }
    }

    if (ret == NULL) {
#ifdef __APPLE__
        am->error = AM_EOPNOTSUPP;
#else
        if (pool->resize++ > AM_SHARED_MAX_RESIZE) {
            am->error = AM_ENOMEM;
        } else {
            if (am_shm_extend(am, (pool->size + size) * 2) == AM_SUCCESS) {
                am_shm_unlock(am);
                return am_shm_alloc(am, usize);
            }
        }
#endif
    }

    am_shm_unlock(am);
    return ret;
}

void am_shm_free(am_shm_t *am, void *ptr) {
    size_t size;
    struct mem_pool *pool;
    struct mem_chunk *e, *f;

    if (am == NULL || am->pool == NULL ||
            ptr == NULL || am_shm_lock(am) != AM_SUCCESS) {
        return;
    }

    pool = (struct mem_pool *) am->pool;
    e = (struct mem_chunk *) ((char *) ptr - SIZEOF_mem_chunk);
    if (e->used == 0) {
        am_shm_unlock(am);
        return;
    }

    size = e->size;

    /* coalesce/combine adjacent chunks */
    if (e->lh.next > 0) {
        f = (struct mem_chunk *) AM_GET_POINTER(pool, e->lh.next);
        if (f->used == 0) {
            size += f->size;
            e->lh.next = f->lh.next;
            if (f->lh.next == 0) {
                pool->lh.next = AM_GET_OFFSET(pool, e);
            } else {
                ((struct mem_chunk *) AM_GET_POINTER(pool, f->lh.next))->lh.prev = AM_GET_OFFSET(pool, e);
            }
        }
    }
    if (e->lh.prev > 0) {
        f = (struct mem_chunk *) AM_GET_POINTER(pool, e->lh.prev);
        if (f->used == 0) {
            size += f->size;
            f->lh.next = e->lh.next;
            if (e->lh.next == 0) {
                pool->lh.next = AM_GET_OFFSET(pool, f);
            } else {
                ((struct mem_chunk *) AM_GET_POINTER(pool, e->lh.next))->lh.prev = e->lh.prev;
            }
            e = f;
        }
    }

    e->used = 0;
    e->size = size;
    e->usize = 0;

    am_shm_unlock(am);
}

void *am_shm_realloc(am_shm_t *am, void *ptr, size_t usize) {
    size_t size;
    struct mem_chunk *e;
    void *vp;

    if (am == NULL || usize == 0) {
        return NULL;
    }
    if (ptr == NULL) {
        return am_shm_alloc(am, usize); /* POSIX.1 semantics */
    }
    e = (struct mem_chunk *) ((char *) ptr - SIZEOF_mem_chunk);
    if (usize <= e->size) {
        e->usize = usize;
        return ptr;
    }
    size = AM_ALIGN(usize + SIZEOF_mem_chunk);
    if (size <= e->size) {
        e->usize = usize;
        return ptr;
    }
    if ((vp = am_shm_alloc(am, usize)) == NULL) {
        return NULL;
    }
    memcpy(vp, ptr, e->usize);
    am_shm_free(am, ptr);
    return vp;
}

void am_shm_info(am_shm_t *am) {
    int i = 0;
    struct mem_pool *pool;
    struct mem_chunk *e, *t, *head;

    if (am == NULL || am->pool == NULL) return;
    pool = (struct mem_pool *) am->pool;

    fprintf(stdout, "\n");
    fprintf(stdout, "AREA   (size: %ld bytes) ", pool->size);

    head = (struct mem_chunk *) AM_GET_POINTER(pool, pool->lh.prev);
    fprintf(stdout, "             HEAD   [P:%d][N:%d]\n", pool->lh.prev, pool->lh.next);

    AM_OFFSET_LIST_FOR_EACH(pool, head, e, t, struct mem_chunk) {
        fprintf(stdout, "CHUNK #%03d: %s  (size: %ld, user: %ld bytes) [P:%d][O:%d][N:%d]\n",
                ++i, e->used ? "used" : "free",
                e->size, e->usize, e->lh.prev,
                AM_GET_OFFSET(pool, e), e->lh.next);
    }
    fprintf(stdout, "\n");
}
