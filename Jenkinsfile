pipeline {
    agent any
    tools {
        nodejs 'Node18'
    }
    triggers {
    cron('30 10 * * *')
    }

    options {
    timeout(time: 1, unit: 'HOURS')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Verify Node & NPM') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }
        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }
        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install'
            }
        }
        stage('Run Playwright Tests') {
            steps {
                bat 'npx playwright test tests/Restd.spec.js --workers=1'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        publishHTML(target: [
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'Playwright Report'
        ])
        }
        success {
        mail to: 'yourmail@gmail.com',
             subject: "SUCCESS: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
             body: "Build succeeded.\nCheck details: ${env.BUILD_URL}"
        }
        failure {
        mail to: 'yourmail@gmail.com',
             subject: "FAILURE: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
             body: "Build failed.\nCheck details: ${env.BUILD_URL}"
    }
    }
}










