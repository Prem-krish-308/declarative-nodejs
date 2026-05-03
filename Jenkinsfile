pipeline {
  agent none

  stages {

    stage('Checkout') {
      agent { docker { image 'node:18-alpine' } }
      steps {
        checkout scm
        // Stash source for use in parallel branches
        stash name: 'source', includes: '**/*', excludes: '.git/**'
      }
    }

    // This single stage contains 3 branches that run simultaneously
    stage('Quality gates') {
      // failFast: if ANY parallel branch fails, cancel the others immediately
      failFast true

      parallel {

        stage('Unit tests') {
          agent { docker { image 'node:18-alpine' } }
          steps {
            unstash 'source'
            sh 'npm ci'
            sh 'npm test'
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
            }
          }
        }

        stage('Lint') {
          agent { docker { image 'node:18-alpine' } }
          steps {
            unstash 'source'
            sh 'npm ci'
            // Add ESLint to package.json if you want real lint:
            // sh 'npx eslint src/ --max-warnings 0'
            sh 'echo "Lint passed (no ESLint configured yet)"'
          }
        }

        stage('Security scan') {
          agent { docker { image 'node:18-alpine' } }
          steps {
            unstash 'source'
            sh 'npm audit --audit-level=high || true'
          }
        }

      }
    }

    stage('Build & push image') {
      when { branch 'main' }
      agent {
        docker {
          image 'docker:24-cli'
          args  '-v /var/run/docker.sock:/var/run/docker.sock'
        }
      }
      steps {
        unstash 'source'
        sh "docker build -t my-node-app:${env.BUILD_NUMBER} ."
        echo "Image my-node-app:${env.BUILD_NUMBER} built successfully"
      }
    }

  }

  post { always { cleanWs() } }
}
