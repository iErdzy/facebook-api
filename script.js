// script.js
import CONFIG from './config.js';

// DOM Element References
const searchInput = document.getElementById('searchInput');
const fetchBtn = document.getElementById('fetchBtn');
const displayArea = document.getElementById('displayArea');
const errorBox = document.getElementById('errorBox');
const loadingIndicator = document.getElementById('loadingIndicator');

/**
 * 1. API Function
 * Fetches data from Facebook Graph API with new fields: birthday and link
 */
async function fetchFacebookData(targetId) {
    // Input Validation (Requirement 9)
    const cleanId = targetId.trim();
    if (!cleanId) {
        showError("Please enter a valid ID or 'me'.");
        return;
    }

    // Toggle Loading State (Requirement 10)
    updateLoadingState(true);

    /** * Requirement 3: Required Parameters
     * Added 'birthday' and 'link' to the fields parameter
     */
    const fields = "id,name,email,picture.type(large),birthday,link,posts{message,created_time}";
    const url = `${CONFIG.BASE_URL}${cleanId}?fields=${fields}&access_token=${CONFIG.FB_ACCESS_TOKEN}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Error Handling (Requirement 8)
        if (!response.ok) {
            // Check for specific error like "Invalid ID"
            throw new Error(data.error?.message || "Failed to fetch data.");
        }

        // Check if data is empty (Requirement 8: No results found)
        if (!data || Object.keys(data).length === 0) {
            showError("No profile found for this ID.");
            return;
        }

        renderUI(data); // Call DOM function

    } catch (err) {
        showError(err.message);
    } finally {
        updateLoadingState(false);
    }
}

/**
 * 2. DOM Manipulation Function (Requirement 7 & 12)
 * Renders the profile card with the new requested fields
 */
function renderUI(data) {
    errorBox.classList.add('hidden');
    
    // Create the profile card using template literals
    displayArea.innerHTML = `
        <div class="profile-card">
            <img src="${data.picture?.data?.url || ''}" class="profile-pic" alt="Profile">
            
            <h2>${data.name}</h2>
            
            <div class="info-list">
                <p><strong>User ID:</strong> ${data.id}</p>
                <p><strong>Email:</strong> ${data.email || '<em>Private</em>'}</p>
                <p><strong>Birthday:</strong> ${data.birthday || '<em>Not Shared (Requires user_birthday permission)</em>'}</p>
                <p><strong>Profile Link:</strong> <a href="${data.link || '#'}" target="_blank">Open Facebook Profile</a></p>
            </div>

            <hr>
            <h4>Recent Activity:</h4>
            ${renderPosts(data.posts)}
        </div>
    `;
}

// Utility function to process the posts list
function renderPosts(posts) {
    if (!posts || !posts.data || posts.data.length === 0) {
        return "<p>No recent public posts found.</p>";
    }
    
    return posts.data.slice(0, 2).map(post => `
        <div class="post-item">
            <small>${new Date(post.created_time).toLocaleDateString()}</small>
            <p>${post.message || 'Shared an update (No text)'}</p>
        </div>
    `).join('');
}

/**
 * 3. Utility Functions (Requirement 14: Code Organization)
 */
function updateLoadingState(isLoading) {
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
        fetchBtn.disabled = true;
        displayArea.innerHTML = '';
        errorBox.classList.add('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
        fetchBtn.disabled = false;
    }
}

function showError(message) {
    errorBox.textContent = `⚠️ Error: ${message}`;
    errorBox.classList.remove('hidden');
    displayArea.innerHTML = '';
}

// Event Listeners
fetchBtn.addEventListener('click', () => fetchFacebookData(searchInput.value));

// Support for Enter Key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchFacebookData(searchInput.value);
});