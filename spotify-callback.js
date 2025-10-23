// Spotify Callback Handler
document.addEventListener('DOMContentLoaded', function() {
    // Get the authorization code from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (error) {
        // Handle authorization error
        console.error('Spotify authorization error:', error);
        showErrorMessage('Failed to connect to Spotify. Please try again.');
        return;
    }
    
    if (code) {
        // Exchange authorization code for access token
        exchangeCodeForToken(code);
    } else {
        showErrorMessage('No authorization code received from Spotify.');
    }
});

// Spotify API Integration
const SPOTIFY_TOKEN = 'BQAvXsML2hQezBBhnVfShazvDFN442gNPe73IQ8rszCFSXbeBZPQX0ZyHQB1HayFRWW-5YMrCENAUafjjcjIqb7eaH7vZf7LKO-dUFHXVJvMZdm3K4_8l2DfwwpC9uA4pw5mb3zHvdTgwzgjlu1J5aE24cNwf3YSUQ8jdWXUqUF8Frs9E3sPHMthrdZl1YRUViOk4zuEC949DExVQRIpj7c0zVh1S-hs5ZuHQAv8nZ2j1ce0ccv2LOSvJihPYfKeD9BCstYEu5wLeY5HWlKr1vtlhmXD12QZaxyYMzEkEKMyY_aYyGzb-uZbwfYKkt1Xw-iBXiVV';

async function fetchWebApi(endpoint, method, body) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${SPOTIFY_TOKEN}`,
        },
        method,
        body: JSON.stringify(body)
    });
    return await res.json();
}

async function getTopTracks() {
    try {
        const response = await fetchWebApi('v1/me/top/tracks?time_range=long_term&limit=5', 'GET');
        return response.items;
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        return [];
    }
}

async function getUserProfile() {
    try {
        return await fetchWebApi('v1/me', 'GET');
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

// Exchange authorization code for access token
async function exchangeCodeForToken(code) {
    try {
        showLoadingMessage('Exchanging authorization code...');
        
        // Simulate token exchange (in real app, this would be done on your backend)
        setTimeout(async () => {
            showLoadingMessage('Access token received...');
            
            setTimeout(async () => {
                showLoadingMessage('Loading your Spotify profile...');
                
                // Fetch user profile
                const userProfile = await getUserProfile();
                if (userProfile) {
                    console.log('User Profile:', userProfile);
                    localStorage.setItem('spotify_user', JSON.stringify(userProfile));
                }
                
                setTimeout(async () => {
                    showLoadingMessage('Loading your top tracks...');
                    
                    // Fetch user's top tracks
                    const topTracks = await getTopTracks();
                    if (topTracks && topTracks.length > 0) {
                        console.log('Top Tracks:', topTracks);
                        localStorage.setItem('spotify_top_tracks', JSON.stringify(topTracks));
                        
                        // Display top tracks in console
                        const trackNames = topTracks.map(
                            ({name, artists}) => `${name} by ${artists.map(artist => artist.name).join(', ')}`
                        );
                        console.log('User\'s Top Tracks:', trackNames);
                    }
                    
                    setTimeout(() => {
                        showSuccessMessage('Spotify connected successfully!');
                        
                        // Redirect to Face ID setup
                        setTimeout(() => {
                            window.location.href = 'faceid.html';
                        }, 2000);
                    }, 2000);
                }, 2000);
            }, 2000);
        }, 2000);
        
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        showErrorMessage('Failed to connect to Spotify. Please try again.');
    }
}

// Show loading message
function showLoadingMessage(message) {
    const messageElement = document.querySelector('.message.active');
    if (messageElement) {
        messageElement.textContent = message;
    }
}

// Show success message
function showSuccessMessage(message) {
    const messageElement = document.querySelector('.message.active');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color = '#4caf50';
    }
    
    // Update the current step
    const currentStep = document.querySelector('.step.current');
    if (currentStep) {
        currentStep.classList.remove('current');
        currentStep.classList.add('active');
        currentStep.querySelector('.step-icon').textContent = '✓';
        currentStep.querySelector('span').textContent = 'Spotify Connected!';
    }
}

// Show error message
function showErrorMessage(message) {
    const messageElement = document.querySelector('.message.active');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color = '#ff6b6b';
    }
    
    // Show retry button
    setTimeout(() => {
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Try Again';
        retryButton.className = 'retry-button';
        retryButton.onclick = () => {
            window.location.href = 'signup.html';
        };
        
        const actionsDiv = document.querySelector('.loading-content');
        actionsDiv.appendChild(retryButton);
    }, 2000);
}

// Add CSS for retry button
const style = document.createElement('style');
style.textContent = `
    .retry-button {
        background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
        color: white;
        border: none;
        border-radius: 25px;
        padding: 15px 30px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
        transition: all 0.3s ease;
    }
    
    .retry-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(29, 185, 84, 0.4);
    }
`;
document.head.appendChild(style);
