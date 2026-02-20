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
                bat 'npx playwright test tests/ACSTDALLLOB.spec.js --headed --workers=1'
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
        emailext(
            subject: "✅ SUCCESS - Playwright Execution",
            body: """
                <h2>Playwright Execution Successful</h2>
                <b>Build:</b> ${env.BUILD_NUMBER}<br><br>

                <a href="${env.JOB_URL}lastBuild/Playwright%20Report/">
                👉 View Report
                </a>
            """,
            mimeType: 'text/html',
            to: "a.velmuruganofficials@gmail.com"
        )
    }

    failure {
        emailext(
            subject: "❌ FAILURE - Playwright Execution",
            body: """
                <h2>Playwright Execution Failed</h2>
                <b>Build:</b> ${env.BUILD_NUMBER}<br><br>

                <a href="${env.BUILD_URL}console">
                👉 View Console Log
                </a><br><br>

                <a href="${env.BUILD_URL}Playwright%20Report/">
                👉 View Report
                </a>
            """,
            mimeType: 'text/html',
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










