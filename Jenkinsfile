pipeline {
  agent any

  environment {
    NODE_ENV = 'test'
    APP_NAME = 'declarative-nodejs'
    JUNIT_OUTPUT = 'test-results/junit.xml'
  }

  options {
    timeout(time: 20, unit: 'MINUTES')
    disableConcurrentBuilds()
    timestamps()
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
        echo "Repo: ${env.JOB_NAME} | Branch: ${env.GIT_BRANCH} | Build: #${env.BUILD_NUMBER}"
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'node --version'
        sh 'npm --version'
        sh 'npm ci'        // npm ci is faster + deterministic vs npm install
      }
    }

    stage('Lint') {
      steps {
        // If you have ESLint: sh 'npx eslint src/'
        // For now just validate the package is intact:
        sh 'npm run test -- --listTests'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: '${JUNIT_OUTPUT}'
        }
      }
    }

    stage('Archive results') {
      steps {
        archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
      }
    }

  }

  post {
    success {
      echo "All stages passed. Build #${env.BUILD_NUMBER} is GREEN."
    }
    failure {
      echo "Build #${env.BUILD_NUMBER} FAILED at stage: ${env.STAGE_NAME}"
    }
    unstable {
      echo "Build UNSTABLE — tests ran but some failed (check Test Results tab)"
    }
    always {
      echo "Duration: ${currentBuild.durationString}"
      cleanWs()
    }
  }
}

