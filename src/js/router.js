// Simple SPA Router for Hash Navigation

let routes = {};
let container = null;
let currentRoute = null;

// Pattern matcher for paths like /project/:id or /project/:id/edit
function matchRoute(routePattern, hashPath) {
    const patternParts = routePattern.split('/');
    const pathParts = hashPath.split('/');
    
    if (patternParts.length !== pathParts.length) return null;
    
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
            const paramName = patternParts[i].slice(1);
            params[paramName] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
            return null;
        }
    }
    return params;
}

// Function to handle routing
export async function handleRouting() {
    // Get the current hash path, defaulting to '/' if empty
    let hash = window.location.hash || '#/';
    let path = hash.substring(1); // Strip the '#'
    
    // Clean up trailing slash unless it's just '/'
    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    
    let matchedRoute = null;
    let params = {};
    
    // Find matching route
    for (const routePattern in routes) {
        const matchedParams = matchRoute(routePattern, path);
        if (matchedParams) {
            matchedRoute = routes[routePattern];
            params = matchedParams;
            break;
        }
    }
    
    // Fallback to home if no route matches
    if (!matchedRoute) {
        console.warn(`Route not found: ${path}. Redirecting to home.`);
        window.location.hash = '#/';
        return;
    }
    
    // Scroll to top on navigation
    window.scrollTo(0, 0);
    
    // Render the view template
    container.innerHTML = matchedRoute.render(params);
    
    // Call the controller setup logic (attach event listeners, fetch data)
    if (matchedRoute.init) {
        matchedRoute.init(params);
    }
}

// Initialize router with routes map and root element ID
export function initRouter(appRoutes, containerId) {
    routes = appRoutes;
    container = document.getElementById(containerId);
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleRouting);
    
    // Initial routing call
    handleRouting();
}

// Helper to navigate to a new hash route
export function navigate(path) {
    window.location.hash = path;
}
