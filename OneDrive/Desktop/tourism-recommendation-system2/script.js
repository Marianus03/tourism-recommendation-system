// Data structure to hold user ratings
let userRatings = [];
let activeUser = 0;  // Assuming user 0 is the active user

// Load the CSV file
Papa.parse("rating.csv", {
    download: true,
    header: true,
    delimiter: ";",  // Specify semicolon as the delimiter
    dynamicTyping: true,
    complete: function(results) {
        userRatings = results.data;
        recommendDestinations();
    }
});

// Function to calculate cosine similarity
function cosineSimilarity(user1, user2) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 1; i < user1.length; i++) {  // Start from index 1 to skip UserID
        dotProduct += user1[i] * user2[i];
        normA += user1[i] * user1[i];
        normB += user2[i] * user2[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Function to get top recommendations based on similar users
function recommendDestinations() {
    let similarities = [];
    let currentUser = Object.values(userRatings[activeUser]);

    // Calculate cosine similarity with all other users
    for (let i = 0; i < userRatings.length; i++) {
        if (i !== activeUser) {
            let otherUser = Object.values(userRatings[i]);
            let similarity = cosineSimilarity(currentUser, otherUser);
            similarities.push({ user: i, similarity: similarity });
        }
    }

    // Sort users by similarity in descending order
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Take the top N similar users
    let topUsers = similarities.slice(0, 3);

    // Calculate recommendations based on the top similar users' ratings
    let recommendedRatings = [0, 0, 0, 0, 0, 0, 0];  // Adjusted for 7 destinations

    topUsers.forEach(user => {
        let otherUserRatings = Object.values(userRatings[user.user]);
        for (let i = 1; i < otherUserRatings.length; i++) {
            recommendedRatings[i-1] += otherUserRatings[i];
        }
    });

    // Normalize the ratings
    for (let i = 0; i < recommendedRatings.length; i++) {
        recommendedRatings[i] = (recommendedRatings[i] / topUsers.length).toFixed(2);
    }

    // Display the top recommended destinations
    displayRecommendations(recommendedRatings);
}

// Function to display recommendations in the UI
function displayRecommendations(recommendations) {
    const recommendationSection = document.querySelector(".recommendation-cards");

    // List of 7 destination names
    const destinationNames = ["Danau Weekuri", "Pantai Ratenggaro", "Pantai Kawona", "Pantai Mandorak", "Pantai Mananga Aba", "Pantai Waikelo", "Kampung Adat Ratenggaro"];

    recommendationSection.innerHTML = "";  // Clear current recommendations

    recommendations.forEach((rating, index) => {
        if (rating > 0) {  // Only recommend destinations with non-zero rating
            const card = `
                <div class="card">
                    <img src="images/destination${index + 1}.jpg" alt="${destinationNames[index]}">
                    <h3>${destinationNames[index]}</h3>
                    <p>Recommended Rating: ${rating}</p>
                    <button>Visit</button>
                    <button>Add to Favorites</button>
                </div>
            `;
            recommendationSection.innerHTML += card;
        }
    });
}
