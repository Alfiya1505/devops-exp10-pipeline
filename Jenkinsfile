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
                bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" build -t devops-exp10 .'
            }
        }

        stage('Deploy Container') {
            steps {
                bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" stop devops-exp10-container || exit 0'
                bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" rm devops-exp10-container || exit 0'
                bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" run -d -p 3000:3000 --name devops-exp10-container devops-exp10'
<<<<<<< HEAD
            }
        }

        stage('Verify Deployment') {
            steps {
                bat 'powershell -Command "Start-Sleep -Seconds 5; Invoke-WebRequest http://localhost:3000/health -UseBasicParsing"'
=======
>>>>>>> c3df690 (Fix Docker path for Jenkins)
            }
        }
    }

    post {
        success {
            echo 'DevOps pipeline completed successfully.'
        }

        failure {
            echo 'DevOps pipeline failed. Check the console output.'
        }
    }
}
