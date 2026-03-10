pipeline {
    agent any
    tools {
        nodejs 'Node18'
    }
    triggers {
    cron('30 10 * * *')
    }
    environment {
    BASE_URL = 'https://www.landydev.com/#/auth/login'
    USERNAME = 'velmurugan@stepladdersolutions.com'
    PASSWORD = 'Test@123'
}


    options {
    timestamps()
    timeout(time: 2, unit: 'HOURS')
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
                bat 'npx playwright test tests/APEXPALLLOB.spec.js --headed --workers=1'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        publishHTML(target: [
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'Playwright Report'
        ])
        }
         success {
        emailext(
            subject: "✅ SUCCESS - Playwright Execution",
            body: """
                Hello,

            Playwright Test Execution Completed.

            Job Name: ${JOB_NAME}
            Build Number: ${BUILD_NUMBER}

            View HTML Report:
            ${BUILD_URL}playwright-report/

            Thanks,
            Jenkins
            """,
            to: "a.velmuruganofficials@gmail.com"
        )
    }

    failure {       
        emailext(
            subject: "❌ FAILURE - Playwright Execution",
            body: """
                Hello,

            Playwright Test Execution Completed.

            Job Name: ${JOB_NAME}
            Build Number: ${BUILD_NUMBER}

            View HTML Report:
            ${BUILD_URL}playwright-report/

            Thanks,
            Jenkins
            """,
            to: "a.velmuruganofficials@gmail.com"
        )
    }

    aborted {
        emailext(
            subject: "⚠ ABORTED - Playwright Execution",
            body: "Build was aborted.",
            to: "a.velmuruganofficials@gmail.com"
        )
    }
    }
}










