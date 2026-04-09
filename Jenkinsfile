pipeline {
    agent any

    stages {

        stage('Clone') {
            steps {
                git 'https://github.com/nishantdeshmukh7/blockchain-devops-project.git'
            }
        }

        stage('Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh '''
                docker run --rm \
                -e SONAR_HOST_URL=http://host.docker.internal:9000 \
                -e SONAR_LOGIN=YOUR_TOKEN \
                -v $(pwd):/usr/src \
                sonarsource/sonar-scanner-cli \
                -Dsonar.projectKey=blockchain-devops-project \
                -Dsonar.sources=.
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t devops-app .'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker stop devops-container || true
                docker rm devops-container || true
                docker run -d -p 3000:3000 --name devops-container devops-app
                '''
            }
        }
    }
}