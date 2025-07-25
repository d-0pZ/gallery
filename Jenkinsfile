pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-24'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 20, unit: 'MINUTES')
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'master', url: 'https://github.com/d-0pZ/gallery.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci --cache ~/.npm-cache'
            }
        }
        
        stage('Security Audit') {
            steps {
                sh 'npm audit --audit-level moderate || true'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
            post {
                failure {
                    emailext (
                        subject: "Test Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                        body: "Tests failed in build ${env.BUILD_NUMBER}. Check console at ${env.BUILD_URL}",
                        to: "iqra.ali3@student.moringaschool.com"
                    )
                }
            }
        }
        
        stage('Deploy to Render') {
            steps {
                echo 'Deployment triggered automatically via GitHub push to Render'
                echo 'App URL: https://gallery-pxfl.onrender.com'
            }
            post {
                success {
                    slackSend(
                        channel: '#iqra_ip1',
                        color: 'good',
                        message: "🚀 Deployment Successful! Build #${env.BUILD_NUMBER} deployed to https://gallery-pxfl.onrender.com",
                        teamDomain: 'DevOps-prjz',
                        tokenCredentialId: 'slack-token',
                        botUser: true
                    )
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}