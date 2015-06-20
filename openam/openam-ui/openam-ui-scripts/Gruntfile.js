/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright (c) 2015 ForgeRock AS. All Rights Reserved
 *
 * The contents of this file are subject to the terms
 * of the Common Development and Distribution License
 * (the License). You may not use this file except in
 * compliance with the License.
 *
 * You can obtain a copy of the License at
 * http://forgerock.org/license/CDDLv1.0.html
 * See the License for the specific language governing
 * permission and limitations under the License.
 *
 * When distributing Covered Code, include this CDDL
 * Header Notice in each file and include the License file
 * at http://forgerock.org/license/CDDLv1.0.html
 * If applicable, add the following below the CDDL Header,
 * with the fields enclosed by brackets [] replaced by
 * your own identifying information:
 * "Portions Copyrighted [year] [name of copyright owner]"
 */

module.exports = function (grunt) {
    grunt.initConfig({
        destination: process.env.OPENAM_HOME,
        forgerockui: process.env.FORGEROCK_UI_SRC,
        sync: {
            source_to_test: {
                files: [
                    {
                        cwd: 'target/dependency',
                        src: ['**'],
                        dest: 'target/www'
                    },
                    {
                        cwd: 'target/codemirror-4.10',
                        src: ['lib/codemirror.js', 'mode/javascript/javascript.js', 'mode/groovy/groovy.js'],
                        dest: 'target/www/libs/codemirror'
                    },
                    {
                        cwd: 'test/libs',
                        src: ['**'],
                        dest: '../../target/www/libs'
                    },
                    {
                        cwd: 'src/main/js',
                        src: ['**'],
                        dest: 'target/www'
                    },
                    {
                        cwd: 'src/main/resources',
                        src: ['**'],
                        dest: 'target/www'
                    },
                    {
                        cwd: 'src/test/resources',
                        src: ['**'],
                        dest: 'target/test'
                    },
                    {
                        cwd: 'src/test/js',
                        src: ['**'],
                        dest: 'target/test'
                    }
                ],
                verbose: true
            },

            source_css_to_test: {
                files: [
                    {
                        cwd: 'target/www',
                        src: ['css/**/*.css'],
                        dest: 'target/test'
                    }
                ],
                verbose: true
            },

            source_to_tomcat: {
                files: [
                    {
                        cwd: '<%= forgerockui %>/forgerock-ui-commons/src/main/js',
                        src: ['**/*'],
                        dest: '<%= destination %>/scripts'
                    },
                    {
                        cwd: '<%= forgerockui %>/forgerock-ui-commons/src/main/resources',
                        src: ['**/*'],
                        dest: '<%= destination %>/scripts'
                    },
                    {
                        cwd: 'src/main/resources',
                        src: ['**/*'],
                        dest: '<%= destination %>/scripts'
                    },
                    {
                        cwd: 'src/main/js',
                        src: ['**/*'],
                        dest: '<%= destination %>/scripts'
                    },
                    {
                        cwd: 'target/test',
                        src: ['**'],
                        dest: '<%= destination %>/../test'
                    },
                    {
                        cwd: 'target/www',
                        src: ['**'],
                        dest: '<%= destination %>/../www'
                    }
                ],
                verbose: true
            }
        },

        watch: {
            editor: {
                files: [
                    '<%= forgerockui %>/forgerock-ui-commons/src/main/js/**',
                    '<%= forgerockui %>/forgerock-ui-commons/src/main/resources/**',
                    'src/main/js/**',
                    'src/main/resources/**',
                    'src/test/js/**',
                    'src/test/resources/**'
                ],
                tasks: ['sync', 'qunit']
            }
        },

        qunit: {
            all: ['target/test/qunit.html']
        },

        notify_hooks: {
            options: {
                enabled: true,
                title: "OpenAM Scripts Editor"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-sync');

    grunt.task.run('notify_hooks');

    grunt.registerTask('default', [
        'sync:source_to_test',
        'sync:source_css_to_test',
        'sync:source_to_tomcat',
        'qunit',
        'watch']);
};