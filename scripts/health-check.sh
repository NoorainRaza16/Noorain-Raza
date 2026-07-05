#!/bin/bash

# Health Check Script for Portfolio Application
# Usage: ./scripts/health-check.sh [URL]

set -euo pipefail

# Configuration
URL="${1:-${HEALTH_CHECK_URL:-http://localhost:5000}}"
TIMEOUT="${HEALTH_CHECK_TIMEOUT:-30}"
MAX_RETRIES="${HEALTH_CHECK_RETRIES:-3}"
RETRY_DELAY="${HEALTH_CHECK_DELAY:-5}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are available
check_dependencies() {
    local deps=("curl")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing dependencies: ${missing[*]}"
        log_info "Please install the missing dependencies and try again"
        exit 1
    fi
}

# Perform health check
health_check() {
    local url="$1"
    local attempt="$2"
    
    log_info "Health check attempt $attempt/$MAX_RETRIES for $url"
    
    # Perform the health check
    local response
    local http_code
    local response_time
    
    response=$(curl -s -w "%{http_code}|%{time_total}" \
        --connect-timeout "$TIMEOUT" \
        --max-time "$TIMEOUT" \
        --user-agent "HealthCheck/1.0" \
        "$url/health" 2>/dev/null || echo "000|0")
    
    http_code=$(echo "$response" | cut -d'|' -f1)
    response_time=$(echo "$response" | cut -d'|' -f2)
    
    # Check HTTP status code
    if [ "$http_code" -eq 200 ]; then
        log_success "Health check passed (HTTP $http_code) - Response time: ${response_time}s"
        return 0
    else
        log_error "Health check failed (HTTP $http_code) - Response time: ${response_time}s"
        return 1
    fi
}

# Additional endpoint checks
check_endpoints() {
    local base_url="$1"
    local endpoints=(
        "/api/footer"
        "/api/hero"
        "/api/about"
        "/api/skills"
        "/api/projects"
    )
    
    log_info "Checking additional endpoints..."
    
    local failed_endpoints=()
    
    for endpoint in "${endpoints[@]}"; do
        local http_code
        http_code=$(curl -s -o /dev/null -w "%{http_code}" \
            --connect-timeout 10 \
            --max-time 10 \
            "$base_url$endpoint" 2>/dev/null || echo "000")
        
        if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 304 ]; then
            log_success "✓ $endpoint (HTTP $http_code)"
        else
            log_error "✗ $endpoint (HTTP $http_code)"
            failed_endpoints+=("$endpoint")
        fi
    done
    
    if [ ${#failed_endpoints[@]} -gt 0 ]; then
        log_warning "Some endpoints failed: ${failed_endpoints[*]}"
        return 1
    else
        log_success "All endpoints are healthy"
        return 0
    fi
}

# Main execution
main() {
    log_info "Starting health check for $URL"
    log_info "Timeout: ${TIMEOUT}s, Max retries: $MAX_RETRIES, Retry delay: ${RETRY_DELAY}s"
    
    # Check dependencies
    check_dependencies
    
    # Perform health check with retries
    local attempt=1
    while [ $attempt -le $MAX_RETRIES ]; do
        if health_check "$URL" "$attempt"; then
            break
        fi
        
        if [ $attempt -lt $MAX_RETRIES ]; then
            log_info "Waiting ${RETRY_DELAY}s before retry..."
            sleep "$RETRY_DELAY"
        fi
        
        ((attempt++))
    done
    
    if [ $attempt -gt $MAX_RETRIES ]; then
        log_error "Health check failed after $MAX_RETRIES attempts"
        exit 1
    fi
    
    # Additional checks
    local checks_passed=true
    
    if ! check_endpoints "$URL"; then
        checks_passed=false
    fi
    
    # Final result
    if [ "$checks_passed" = true ]; then
        log_success "All health checks passed successfully!"
        exit 0
    else
        log_warning "Some health checks failed, but service is running"
        exit 0
    fi
}

# Run main function
main "$@"