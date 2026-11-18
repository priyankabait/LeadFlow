pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_VERSION = '2'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Code checked out successfully'
            }
        }

        stage('Backend - Install & Test') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test || true'
                }
            }
        }

        stage('Frontend - Install & Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying LeadFlow...'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo 'LeadFlow build succeeded!'
        }
        failure {
            echo 'LeadFlow build failed!'
        }
        always {
            cleanWs()
        }
    }
}
