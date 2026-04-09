pipeline {
    agent any

    environment {
        SONAR_TOKEN = 'squ_8f24d24e7244fd138ddc4c842a33fd910f764992'
    }

    stages {

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

stage('SonarQube Analysis') {
    steps {
        sh '''
        docker run --rm \
        -v $(pwd):/usr/src \
        sonarsource/sonar-scanner-cli \
        -Dsonar.projectKey=blockchain-devops-project \
        -Dsonar.projectName=blockchain-devops-project \
        -Dsonar.sources=. \
        -Dsonar.host.url=http://host.docker.internal:9000 \
        -Dsonar.login=$SONAR_TOKEN
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