pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-24'
    }
    
    environment {
        MONGODB_URI_PRODUCTION = credentials('mongodb-uri-production')
        MONGODB_URI_DEVELOPMENT = credentials('mongodb-uri-development')
        MONGODB_URI_TEST = credentials('mongodb-uri-test')
        RENDER_APP_URL = 'https://gallery-pxfl.onrender.com'
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
                sh 'npm ci --cache ~/.npm-cache --silent'
            }
        }
        
        stage('Security Audit') {
            steps {
                sh 'npm audit --audit-level moderate || true'
            }
        }
        
        stage('Run Tests') {
            steps {
                // Filter MongoDB URIs from output
                sh '''
                    npm test 2>&1 | sed 's/mongodb:\\/\\/[^:]*:[^@]*@[^/]*/mongodb:\\/\\/***:***@***/g'
                '''
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
                echo "App URL: ${env.RENDER_APP_URL}"
                echo 'Waiting for deployment to complete...'
                
                // Wait for deployment to process
                sleep time: 30, unit: 'SECONDS'
                
                // Checking if deployment is successful by testing the URL
                script {
                    def maxRetries = 10
                    def retryCount = 0
                    def deploymentSuccess = false
                    
                    while (retryCount < maxRetries && !deploymentSuccess) {
                        try {
                            sh "curl -f -s --max-time 30 ${env.RENDER_APP_URL} > /dev/null"
                            deploymentSuccess = true
                            echo "✅ Deployment verified successfully!"
                        } catch (Exception e) {
                            retryCount++
                            echo "⏳ Deployment check ${retryCount}/${maxRetries} failed, retrying in 30s..."
                            sleep time: 30, unit: 'SECONDS'
                        }
                    }
                    
                    if (!deploymentSuccess) {
                        error "❌ Deployment verification failed after ${maxRetries} attempts"
                    }
                }
            }
            post {
                success {
                    slackSend(
                        channel: '#iqra_ip1',
                        color: 'good',
                        message: "🚀 Deployment Successful! Build #${env.BUILD_NUMBER} deployed to ${env.RENDER_APP_URL}",
                        teamDomain: 'Ammar',
                        tokenCredentialId: 'slack-token',
                        botUser: true
                    )
                }
                failure {
                    slackSend(
                        channel: '#iqra_ip1',
                        color: 'danger',
                        message: "❌ Deployment Failed! Build #${env.BUILD_NUMBER} - Check logs at ${env.BUILD_URL}",
                        teamDomain: 'Ammar',
                        tokenCredentialId: 'slack-token',
                        botUser: true
                    )
                    emailext (
                        subject: "Deployment Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                        body: "Deployment failed in build ${env.BUILD_NUMBER}. Check console at ${env.BUILD_URL} and Render logs.",
                        to: "iqra.ali3@student.moringaschool.com"
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
            emailext (
                subject: "Pipeline Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Pipeline failed in build ${env.BUILD_NUMBER}. Check console at ${env.BUILD_URL}",
                to: "iqra.ali3@student.moringaschool.com"
            )
        }
    }
}