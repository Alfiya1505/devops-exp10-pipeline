pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t devops-exp10 .'
            }
        }

        stage('Deploy Container') {
            steps {
                bat 'docker stop devops-exp10-container || exit 0'
                bat 'docker rm devops-exp10-container || exit 0'
                bat 'docker run -d -p 3000:3000 --name devops-exp10-container devops-exp10'
            }
        }
    }
}