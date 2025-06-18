
/*
document.addEventListener('DOMContentLoaded', () => {

  const firebaseConfig = {
  apiKey: "AIzaSyD8p7wI6cxWi9DmhevXlBzwloNVozJ9tA8",
  authDomain: "sharpsell-demo.firebaseapp.com",
  projectId: "sharpsell-demo",
  storageBucket: "sharpsell-demo.firebasestorage.app",
  messagingSenderId: "1056535284431",
  appId: "1:1056535284431:web:541e38889f464d442885ba"
};

   firebase.initializeApp(firebaseConfig);
   const db=firebase.database();
    // --- Get all DOM elements ---
    const contentForm = document.getElementById('contentForm');
    const generateScriptBtn = document.getElementById('generateScriptBtn');
    const generateVideoBtn = document.getElementById('generateVideoBtn');
    const fileInput = document.getElementById('fileInput');
    const textContent = document.getElementById('textContent');
    const personalizationOptions = document.getElementById('personalization-options');
    const scriptOutput = document.getElementById('script-output');
    const loader = document.getElementById('loader');
    const videoPlayerWrapper = document.getElementById('video-player-wrapper');
    const videoPlayer = document.getElementById('video-player');
    const videoError = document.getElementById('video-error');
    
    // Updated tab button references
    const tabButton2 = document.getElementById('tabButton2');
    const tabButton3 = document.getElementById('tabButton3');
    const tabButton4 = document.getElementById('tabButton4');

    const numPointsSlider = document.getElementById('num_points');
    const numPointsValue = document.getElementById('num_points_value');
    
    // --- NEW: Button to go from script editing to avatar selection ---
    const goToAvatarBtn = document.getElementById('goToAvatarBtn');
    
    // Avatar Selection Elements
    const avatarGrid = document.getElementById('avatar-selection-grid');
    let selectedAvatarId = null;

    // Hardcoded Avatar Data (Replace with API call later)
    const avatars = [
        { id: 'Judith_Business_Sitting_Front_public', name: 'Judith', preview: 'https://files2.heygen.ai/avatar/v3/375e726a54994c5e8233da3703377813_44930/preview_talk_3.webp' },
        { id: 'Abigail_expressive_2024112501', name: 'Abigail', preview: 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_target.webp' },
        { id: 'Diran_iPad_Front_public', name: 'Diran', preview: 'https://files2.heygen.ai/avatar/v3/7ee42a37066f496790e1070606547b90_42290/preview_talk_1.webp' },
        {id:'Carlotta_Business_Front_public',name:'Carlotta',preview:'https://files2.heygen.ai/avatar/v3/8a6b6606ed164dd686941b9cf7b454b3_47080/preview_talk_1.webp'},
        {id:'Hada_Suit_Front_public',name:'Hada',preview:'https://files2.heygen.ai/avatar/v3/c917762dec9a4db6b0ee92b69bc14a93_45020/preview_target.webp'}
    ];

    // Function to display avatars in the grid
    const displayAvatars = () => {
        avatarGrid.innerHTML = ''; // Clear previous avatars
        avatars.forEach(avatar => {
            const avatarItem = document.createElement('div');
            avatarItem.className = 'avatar-item';
            avatarItem.dataset.avatarId = avatar.id;
            avatarItem.innerHTML = `<img src="${avatar.preview}" alt="${avatar.name}"><p>${avatar.name}</p>`;
            avatarItem.addEventListener('click', () => {
                document.querySelectorAll('.avatar-item').forEach(item => item.classList.remove('selected'));
                avatarItem.classList.add('selected');
                selectedAvatarId = avatar.id;
            });
            avatarGrid.appendChild(avatarItem);
        });
    };

       document.querySelectorAll('input[name="inputMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('file-input-container').style.display = e.target.value === 'file' ? 'block' : 'none';
            document.getElementById('text-input-container').style.display = e.target.value === 'text' ? 'block' : 'none';
            fileInput.value = ''; textContent.value = ''; personalizationOptions.style.display = 'none';
        });
    });
    const showPersonalization = () => {
        if (fileInput.files.length > 0 || textContent.value.trim() !== '') {
            personalizationOptions.style.display = 'block';
        } else {
            personalizationOptions.style.display = 'none';
        }
    };
    fileInput.addEventListener('change', showPersonalization);
    textContent.addEventListener('input', showPersonalization);
    numPointsSlider.addEventListener('input', (e) => { numPointsValue.textContent = e.target.value; });

    // --- Step 1: Generate Script ---
    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setButtonLoading(generateScriptBtn, true, 'Generating Script...');
        try {
            const response = await fetch('/api/process-content', { method: 'POST', body: new FormData(contentForm) });
            const data = await response.json();
            if (response.ok) {
                scriptOutput.value = data.script;
                tabButton2.disabled = false; // Enable "Personalize Script" tab
                openTab(null, 'tab2');
            } else { throw new Error(data.error || 'Failed to process content.'); }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setButtonLoading(generateScriptBtn, false, 'Generate Script');
        }
    });

    // --- NEW: Step 2 -> Step 3 Navigation ---
    goToAvatarBtn.addEventListener('click', () => {
        if (!scriptOutput.value.trim()) {
            alert("Error: The script cannot be empty. Please edit or re-generate it.");
            return;
        }
        if(!VideoTitleInput.value.trim()){
            alert('Error:please enter a title for your video.');
            return;
        }
        tabButton3.disabled = false; // Enable "Select Avatar" tab
        openTab(null, 'tab3');
        displayAvatars(); // Display avatars when moving to this tab
    });

    // --- Step 3: Generate Video Presentation ---
    generateVideoBtn.addEventListener('click', async () => {
        const finalScript = scriptOutput.value.trim();
        const videoTitle= videoTitleInput.value.trim();
        if (!selectedAvatarId) {
            alert("Error: Please select an avatar before generating the video.");
            return;
        }
        if(!videoTitle){
            alert('Error:please go back and enter a video Title ');
            return;
        }

        setButtonLoading(generateVideoBtn, true, 'Starting Generation...');
        openTab(null, 'tab4'); // Go to the video tab
        loader.style.display = 'block';
        videoPlayerWrapper.style.display = 'none';
        videoError.style.display = 'none';

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ script: finalScript, avatarId: selectedAvatarId }),
            });
            const data = await response.json();
            if (response.ok && data.videoId) {
                tabButton4.disabled = false; // Enable final video tab
                pollVideoStatus(data.videoId);
            } else {
                throw new Error(data.details || data.error || 'Failed to start video generation.');
            }
        } catch (error) {
            showVideoError(error.message);
            setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
        }
    });

    const pollVideoStatus = (videoId) => {
        console.log(`Starting to poll for video ID: ${videoId}`);
        let attempts = 0;
        const maxAttempts = 150; // Poll for 6 minutes max (36 * 10s)

        const interval = setInterval(async () => {
            if (++attempts > maxAttempts) {
                clearInterval(interval);
                showVideoError('Video generation is taking longer than expected. Please check your HeyGen dashboard.');
                setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
                return;
            }
            try {
                const response = await fetch(`/api/video-status/${videoId}`);
                const data = await response.json();
                console.log(`[Attempt ${attempts}] Polling status:`, data);

                if (!response.ok) {
                    throw new Error(data.details || data.error || 'Failed to get video status.');
                }

                if (data.status === 'completed') {
                    clearInterval(interval);
                    loader.style.display = 'none';
                    videoPlayer.src = data.url;
                    videoPlayerWrapper.style.display = 'block';
                    setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    showVideoError(data.error || 'Video generation failed.');
                    setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
                }
                // If status is 'processing' or anything else, just continue polling
            } catch (error) {
                clearInterval(interval);
                showVideoError(error.message);
                setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
            }
        }, 10000); // Poll every 10 seconds
    };

    const setButtonLoading = (button, isLoading, text) => {
        button.disabled = isLoading;
        button.textContent = text;
    };
    
    const showVideoError = (message) => {
        loader.style.display = 'none';
        videoError.textContent = 'Error: ' + message;
        videoError.style.display = 'block';
    }
});

// Global function to switch tabs (No changes needed)
function openTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).style.display = 'block';
    const targetButton = evt ? evt.currentTarget : document.querySelector(`button[onclick*="'${tabName}'"]`);
    if(targetButton) targetButton.classList.add('active');
}*/
/*document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Setup ---
    const firebaseConfig = {
      apiKey: "AIzaSyD8p7wI6cxWi9DmhevXlBzwloNVozJ9tA8",
      authDomain: "sharpsell-demo.firebaseapp.com",
      projectId: "sharpsell-demo",
      storageBucket: "sharpsell-demo.firebasestorage.app",
      messagingSenderId: "1056535284431",
      appId: "1:1056535284431:web:541e38889f464d442885ba"
    };
    
    // Initialize Firebase and Firestore
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // --- Get all DOM elements ---
    const contentForm = document.getElementById('contentForm');
    const generateScriptBtn = document.getElementById('generateScriptBtn');
    const generateVideoBtn = document.getElementById('generateVideoBtn');
    const fileInput = document.getElementById('fileInput');
    const textContent = document.getElementById('textContent');
    const personalizationOptions = document.getElementById('personalization-options');
    const scriptOutput = document.getElementById('script-output');
    const loader = document.getElementById('loader');
    const videoPlayerWrapper = document.getElementById('video-player-wrapper');
    const videoPlayer = document.getElementById('video-player');
    const videoError = document.getElementById('video-error');
    
    const videoTitleInput = document.getElementById('videoTitle');
    const dashboardTableBody = document.getElementById('dashboard-table-body');
    
    const tabButton2 = document.getElementById('tabButton2');
    const tabButton3 = document.getElementById('tabButton3');
    const tabButton4 = document.getElementById('tabButton4');

    const numPointsSlider = document.getElementById('num_points');
    const numPointsValue = document.getElementById('num_points_value');
    
    const goToAvatarBtn = document.getElementById('goToAvatarBtn');
    
    const avatarGrid = document.getElementById('avatar-selection-grid');
    
    // --- State variables ---
    let selectedAvatarId = null;
    let selectedAvatarPosterUrl = null; // NEW: To store poster image
    let uploadedFilename = null; // NEW: To store the source filename

    const avatars = [
        { id: 'Judith_Business_Sitting_Front_public', name: 'Judith', preview: 'https://files2.heygen.ai/avatar/v3/375e726a54994c5e8233da3703377813_44930/preview_talk_3.webp' },
        { id: 'Abigail_expressive_2024112501', name: 'Abigail', preview: 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_target.webp' },
        { id: 'Diran_iPad_Front_public', name: 'Diran', preview: 'https://files2.heygen.ai/avatar/v3/7ee42a37066f496790e1070606547b90_42290/preview_talk_1.webp' },
        {id:'Carlotta_Business_Front_public',name:'Carlotta',preview:'https://files2.heygen.ai/avatar/v3/8a6b6606ed164dd686941b9cf7b454b3_47080/preview_talk_1.webp'},
        {id:'Hada_Suit_Front_public',name:'Hada',preview:'https://files2.heygen.ai/avatar/v3/c917762dec9a4db6b0ee92b69bc14a93_45020/preview_target.webp'}
    ];

    const displayAvatars = () => {
        avatarGrid.innerHTML = '';
        avatars.forEach(avatar => {
            const avatarItem = document.createElement('div');
            avatarItem.className = 'avatar-item';
            avatarItem.dataset.avatarId = avatar.id;
            avatarItem.innerHTML = `<img src="${avatar.preview}" alt="${avatar.name}"><p>${avatar.name}</p>`;
            avatarItem.addEventListener('click', () => {
                document.querySelectorAll('.avatar-item').forEach(item => item.classList.remove('selected'));
                avatarItem.classList.add('selected');
                // NEW: Store both ID and poster URL
                selectedAvatarId = avatar.id;
                selectedAvatarPosterUrl = avatar.preview;
            });
            avatarGrid.appendChild(avatarItem);
        });
    };

    document.querySelectorAll('input[name="inputMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isFile = e.target.value === 'file';
            document.getElementById('file-input-container').style.display = isFile ? 'block' : 'none';
            document.getElementById('text-input-container').style.display = isFile ? 'none' : 'block';
            fileInput.value = ''; 
            textContent.value = ''; 
            personalizationOptions.style.display = 'none';
            // NEW: Reset filename
            uploadedFilename = isFile ? null : 'Pasted Text';
        });
    });

    const showPersonalization = () => {
        if (fileInput.files.length > 0 || textContent.value.trim() !== '') {
            personalizationOptions.style.display = 'block';
        } else {
            personalizationOptions.style.display = 'none';
        }
    };

    fileInput.addEventListener('change', (e) => {
        // NEW: Store the filename when a file is selected
        if(e.target.files.length > 0) {
            uploadedFilename = e.target.files[0].name;
        }
        showPersonalization();
    });
    textContent.addEventListener('input', showPersonalization);
    numPointsSlider.addEventListener('input', (e) => { numPointsValue.textContent = e.target.value; });

    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setButtonLoading(generateScriptBtn, true, 'Generating Script...');
        try {
            const response = await fetch('/api/process-content', { method: 'POST', body: new FormData(contentForm) });
            const data = await response.json();
            if (response.ok) {
                scriptOutput.value = data.script;
                tabButton2.disabled = false;
                openTab(null, 'tab2');
            } else { throw new Error(data.error || 'Failed to process content.'); }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setButtonLoading(generateScriptBtn, false, 'Generate Script');
        }
    });

    goToAvatarBtn.addEventListener('click', () => {
        if (!scriptOutput.value.trim() || !videoTitleInput.value.trim()) {
            alert("Error: Please provide a title and ensure the script is not empty.");
            return;
        }
        tabButton3.disabled = false;
        openTab(null, 'tab3');
        displayAvatars();
    });

    generateVideoBtn.addEventListener('click', async () => {
        const finalScript = scriptOutput.value.trim();
        const videoTitle = videoTitleInput.value.trim();

        if (!selectedAvatarId) {
            alert("Error: Please select an avatar.");
            return;
        }

        setButtonLoading(generateVideoBtn, true, 'Starting Generation...');
        openTab(null, 'tab4');
        loader.style.display = 'block';
        videoPlayerWrapper.style.display = 'none';
        videoError.style.display = 'none';

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ script: finalScript, avatarId: selectedAvatarId }),
            });
            const data = await response.json();
            if (response.ok && data.videoId) {
                tabButton4.disabled = false;
                const videoId = data.videoId;
                // NEW: Save initial video data to Firestore
                db.collection('videos').doc(videoId).set({
                    videoId: videoId,
                    title: videoTitle,
                    status: 'processing',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Firestore timestamp
                    posterUrl: selectedAvatarPosterUrl, // Save poster
                    sourceFile: uploadedFilename // Save filename
                });
                pollVideoStatus(videoId);
            } else {
                throw new Error(data.details || data.error || 'Failed to start video generation.');
            }
        } catch (error) {
            showVideoError(error.message);
            setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
        }
    });

    const pollVideoStatus = (videoId) => {
        const videoDocRef = db.collection('videos').doc(videoId);
        let attempts = 0;
        const maxAttempts = 150; 

        const interval = setInterval(async () => {
            if (++attempts > maxAttempts) {
                clearInterval(interval);
                showVideoError('Video generation is taking longer than expected.');
                videoDocRef.update({ status: 'failed', error: 'Timeout' });
                setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
                return;
            }
            try {
                const response = await fetch(`/api/video-status/${videoId}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.details || data.error);

                if (data.status === 'completed') {
                    clearInterval(interval);
                    loader.style.display = 'none';
                    videoPlayer.src = data.url;
                    videoPlayerWrapper.style.display = 'block';
                    // NEW: Update status and add URL in Firestore
                    videoDocRef.update({ status: 'completed', videoUrl: data.url });
                    setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    showVideoError(data.error || 'Video generation failed.');
                    // NEW: Update status and add error in Firestore
                    videoDocRef.update({ status: 'failed', error: data.error });
                    setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
                }
            } catch (error) {
                clearInterval(interval);
                showVideoError(error.message);
                videoDocRef.update({ status: 'failed', error: error.message });
                setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
            }
        }, 10000);
    };
    
    // --- Dashboard Functions (for Firestore) ---
    const loadDashboard = () => {
        // Order by creation time, newest first
        const videosCollection = db.collection('videos').orderBy('createdAt', 'desc'); 
        
        videosCollection.onSnapshot((snapshot) => {
            dashboardTableBody.innerHTML = ''; // Clear existing rows
            snapshot.docs.forEach((doc) => {
                const videoData = doc.data();
                const row = document.createElement('tr');
                
                // Firestore timestamps must be converted to JS Date objects
                const createdAt = videoData.createdAt ? new Date(videoData.createdAt.toDate()).toLocaleString() : 'N/A';
                
                const statusBadge = `<span class="status-badge status-${videoData.status}">${videoData.status}</span>`;
                
                const isCompleted = videoData.status === 'completed';
                const actions = `
                    <button class="action-btn preview" data-url="${videoData.videoUrl || ''}" ${!isCompleted ? 'disabled' : ''}>Preview</button>
                    <a href="${videoData.videoUrl || '#'}" download="${videoData.title}.mp4">
                       <button class="action-btn download" ${!isCompleted ? 'disabled' : ''}>Download</button>
                    </a>
                `;

                // Display poster image along with the title
                const titleCell = `
                    <div style="display: flex; align-items: center;">
                        <img src="${videoData.posterUrl}" alt="poster" style="width: 60px; height: 34px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
                        <span>${videoData.title || 'N/A'}</span>
                    </div>
                `;

                row.innerHTML = `
                    <td>${titleCell}</td>
                    <td>${statusBadge}</td>
                    <td>${createdAt}</td>
                    <td>${actions}</td>
                `;

                dashboardTableBody.appendChild(row);
            });

            document.querySelectorAll('.action-btn.preview').forEach(button => {
                button.addEventListener('click', (e) => {
                    const url = e.currentTarget.dataset.url;
                    if (url) {
                        videoPlayer.src = url;
                        videoPlayerWrapper.style.display = 'block';
                        loader.style.display = 'none';
                        videoError.style.display = 'none';
                        openTab(null, 'tab4');
                    }
                });
            });
        }, (error) => {
            console.error("Error fetching videos from Firestore: ", error);
            dashboardTableBody.innerHTML = '<tr><td colspan="4">Could not load video data.</td></tr>';
        });
    };
    
    loadDashboard();

    const setButtonLoading = (button, isLoading, text) => {
        button.disabled = isLoading;
        button.textContent = text;
    };
    
    const showVideoError = (message) => {
        loader.style.display = 'none';
        videoError.textContent = 'Error: ' + message;
        videoError.style.display = 'block';
    }
});

function openTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).style.display = 'block';
    const targetButton = evt ? evt.currentTarget : document.querySelector(`.sidebar-nav button[onclick*="'${tabName}'"]`);
    if(targetButton) targetButton.classList.add('active');
}*/
document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Setup ---
    const firebaseConfig = {
      apiKey: "AIzaSyD8p7wI6cxWi9DmhevXlBzwloNVozJ9tA8",
      authDomain: "sharpsell-demo.firebaseapp.com",
      projectId: "sharpsell-demo",
      storageBucket: "sharpsell-demo.firebasestorage.app",
      messagingSenderId: "1056535284431",
      appId: "1:1056535284431:web:541e38889f464d442885ba"
    };
    
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const storage=firebase.storage();

    // --- DOM elements ---
    const contentForm = document.getElementById('contentForm');
    const generateScriptBtn = document.getElementById('generateScriptBtn');
    const generateVideoBtn = document.getElementById('generateVideoBtn');
    const fileInput = document.getElementById('fileInput');
    const textContent = document.getElementById('textContent');
    const scriptOutput = document.getElementById('script-output');
    const loader = document.getElementById('loader');
    const videoPlayerWrapper = document.getElementById('video-player-wrapper');
    const videoPlayer = document.getElementById('video-player');
    const videoError = document.getElementById('video-error');
    const videoTitleInput = document.getElementById('videoTitle');
    const dashboardTableBody = document.getElementById('dashboard-table-body');
    const tabButton2 = document.getElementById('tabButton2');
    const tabButton3 = document.getElementById('tabButton3');
    const tabButton4 = document.getElementById('tabButton4');
    const goToAvatarBtn = document.getElementById('goToAvatarBtn');
    const avatarGrid = document.getElementById('avatar-selection-grid');
    
    // --- State variables ---
    let selectedAvatarId = null;
    let selectedAvatarPosterUrl = null;
    let uploadedFilename = 'Pasted Text'; // Default for text input

    const avatars = [
        { id: 'Adriana_Business_Front_2_public', name: 'Adriana', preview: 'https://files2.heygen.ai/avatar/v3/88dbd2785def417ca7a2b79d4cf40c6d_42780/preview_talk_3.webp' },
        { id: 'Abigail_expressive_2024112501', name: 'Abigail', preview: 'https://files2.heygen.ai/avatar/v3/1ad51ab9fee24ae88af067206e14a1d8_44250/preview_target.webp' },
        { id: 'Armando_Casual_Front_public', name: 'Armando', preview: 'https://files2.heygen.ai/avatar/v3/fa717f667b7b4e41b0d7e4fd320ab080_43280/preview_talk_1.webp' },
        { id: 'Carlotta_Business_Front_public',name:'Carlotta',preview:'https://files2.heygen.ai/avatar/v3/8a6b6606ed164dd686941b9cf7b454b3_47080/preview_talk_1.webp'},
        { id: 'Annelise_public_3',name:'Annelise',preview:'https://files2.heygen.ai/avatar/v3/8ce8a7654c3f4ef2a0cbad698e788c2f_58440/preview_target.webp'}
    ];

    const displayAvatars = () => {
        avatarGrid.innerHTML = '';
        avatars.forEach(avatar => {
            const avatarItem = document.createElement('div');
            avatarItem.className = 'avatar-item';
            avatarItem.dataset.avatarId = avatar.id;
            avatarItem.innerHTML = `<img src="${avatar.preview}" alt="${avatar.name}"><p>${avatar.name}</p>`;
            avatarItem.addEventListener('click', () => {
                document.querySelectorAll('.avatar-item').forEach(item => item.classList.remove('selected'));
                avatarItem.classList.add('selected');
                selectedAvatarId = avatar.id;
                selectedAvatarPosterUrl = avatar.preview;
            });
            avatarGrid.appendChild(avatarItem);
        });
    };

    document.querySelectorAll('input[name="inputMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isFile = e.target.value === 'file';
            document.getElementById('file-input-container').style.display = isFile ? 'block' : 'none';
            document.getElementById('text-input-container').style.display = isFile ? 'none' : 'block';
            fileInput.value = ''; 
            textContent.value = ''; 
            document.getElementById('personalization-options').style.display = 'none';
            uploadedFilename = isFile ? null : 'Pasted Text';
        });
    });

    fileInput.addEventListener('change', (e) => {
        if(e.target.files.length > 0) {
            uploadedFilename = e.target.files[0].name;
            document.getElementById('personalization-options').style.display = 'block';
        }
    });
    textContent.addEventListener('input', () => {
        if(textContent.value.trim() !== '') {
            document.getElementById('personalization-options').style.display = 'block';
        }
    });

    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setButtonLoading(generateScriptBtn, true, 'Generating Script...');
        try {
            const response = await fetch('/api/process-content', { method: 'POST', body: new FormData(contentForm) });
            const data = await response.json();
            if (response.ok) {
                scriptOutput.value = data.script;
                tabButton2.disabled = false;
                openTab(null, 'tab2');
            } else { throw new Error(data.error || 'Failed to process content.'); }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setButtonLoading(generateScriptBtn, false, 'Generate Script');
        }
    });

    goToAvatarBtn.addEventListener('click', () => {
        if (!scriptOutput.value.trim() || !videoTitleInput.value.trim()) {
            alert("Error: Please provide a title and ensure the script is not empty.");
            return;
        }
        tabButton3.disabled = false;
        openTab(null, 'tab3');
        displayAvatars();
    });

    generateVideoBtn.addEventListener('click', async () => {
        const finalScript = scriptOutput.value.trim();
        const videoTitle = videoTitleInput.value.trim();

        if (!selectedAvatarId) {
            alert("Error: Please select an avatar.");
            return;
        }

        setButtonLoading(generateVideoBtn, true, 'Starting Generation...');
        openTab(null, 'tab4');
        loader.style.display = 'block';
        videoPlayerWrapper.style.display = 'none';
        videoError.style.display = 'none';

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ script: finalScript, avatarId: selectedAvatarId }),
            });
            const data = await response.json();

            // ### IMPORTANT REFINEMENT: Only create Firestore doc on SUCCESSFUL API call ###
            if (response.ok && data.videoId) {
                tabButton4.disabled = false;
                const videoId = data.videoId;
                // Create the Firestore document now that we have a valid videoId
                // ... inside generateVideoBtn listener ...

// Change 'videos' to 'poster' here
db.collection('poster').doc(videoId).set({ 
    videoId: videoId,
    title: videoTitle,
    status: 'processing',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    posterUrl: selectedAvatarPosterUrl,
    sourceFile: uploadedFilename || 'Pasted Text'
});
pollVideoStatus(videoId);
            } else {
                // If API fails, throw an error BEFORE creating a doc
                throw new Error(data.details || data.error || 'Failed to start video generation.');
            }
        } catch (error) {
            showVideoError(error.message);
            setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
        }
    });

    // REVISED AND CORRECTED SCRIPT.JS FUNCTION

const pollVideoStatus = (videoId) => {
    const videoDocRef = db.collection('poster').doc(videoId);
    let attempts = 0;
    const maxAttempts = 150; 

    const interval = setInterval(async () => {
        if (++attempts > maxAttempts) {
            clearInterval(interval);
            showVideoError('Video generation is taking longer than expected.');
            videoDocRef.update({ status: 'failed', error: 'Timeout' });
            setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
            return;
        }
        try {
            const response = await fetch(`/api/video-status/${videoId}`);
            const responseData = await response.json(); // Use a different name to avoid confusion
            if (!response.ok) throw new Error(responseData.details || responseData.error||'Polling Request Failed');
            
            if (!responseData.data) {
                    throw new Error(responseData.error || 'Invalid response from server during polling.');
                }

            // The actual data from HeyGen is in the 'data' property of the response
            const videoData = responseData.data; // <-- FIXED: Get the nested data object

            if (videoData.status === 'completed') { // <-- FIXED: Check status inside the nested object
                clearInterval(interval);
                loader.style.display = 'none';
                videoPlayer.src = videoData.video_url; // <-- FIXED: Get the URL from the nested object
                videoPlayerWrapper.style.display = 'block';
                videoDocRef.update({ status: 'completed', videoUrl: videoData.video_url });
                setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
            } else if (videoData.status === 'failed') { // <-- FIXED: Check status inside the nested object
                clearInterval(interval);
                
const errorMessage = typeof videoData.error === 'object' 
    ? JSON.stringify(videoData.error) 
    : videoData.error || 'Video generation failed.'; // <-- FIXED: Get error from nested object
                showVideoError(errorMessage);
                videoDocRef.update({ status: 'failed', error: errorMessage });
                setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
            }
            
} catch (error) {
    clearInterval(interval);
    showVideoError(error.message);
    // Add a 'catch' here to prevent unhandled promise rejections if the
    // database update itself fails (e.g., due to permissions).
    videoDocRef.update({ status: 'failed', error: error.message }).catch(dbError => {
        console.error("Could not update document status to 'failed':", dbError);
    });
    setButtonLoading(generateVideoBtn, false, '✨ Generate Video Presentation');
}
    }, 10000); // Poll every 10 seconds
};
    
// --- CORRECTED AND FINAL loadDashboard FUNCTION ---
const loadDashboard = () => {
    const videosCollection = db.collection('poster').orderBy('createdAt', 'desc'); 
    
    videosCollection.onSnapshot((snapshot) => {
        dashboardTableBody.innerHTML = '';
        if (snapshot.empty) {
            dashboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No videos created yet.</td></tr>';
            return;
        }
        snapshot.docs.forEach((doc) => {
            const videoData = doc.data();
            const row = document.createElement('tr');
            
            const createdAt = videoData.createdAt ? new Date(videoData.createdAt.toDate()).toLocaleString() : 'N/A';
            const statusBadge = `<span class="status-badge status-${videoData.status}">${videoData.status}</span>`;
            const isCompleted = videoData.status === 'completed';

            // Define the actions HTML string
            const actions = `
                <button class="action-btn preview" data-url="${videoData.videoUrl || ''}" ${!isCompleted ? 'disabled' : ''}>Preview</button>
                <a href="${isCompleted ? videoData.videoUrl : '#'}" download="${videoData.title || 'video'}.mp4" style="text-decoration: none;">
                   <button class="action-btn download" ${!isCompleted ? 'disabled' : ''}>Download</button>
                </a>
            `;

            // Define the title cell HTML string
            const titleCell = `
                <div style="display: flex; align-items: center;">
                    <img src="${videoData.posterUrl || '/static/placeholder.png'}" alt="poster" style="width: 60px; height: 34px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
                    <span>${videoData.title || 'N/A'}</span>
                </div>
            `;

            // THIS IS THE FIX: Use the variables correctly to build the final row.
            row.innerHTML = `
                <td>${titleCell}</td>
                <td>${statusBadge}</td>
                <td>${createdAt}</td>
                <td>${actions}</td>
            `;

            dashboardTableBody.appendChild(row);
        });

        // Re-attach event listeners for the preview buttons
        document.querySelectorAll('.action-btn.preview').forEach(button => {
            button.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                if (url) {
                    videoPlayer.src = url;
                    videoPlayerWrapper.style.display = 'block';
                    loader.style.display = 'none';
                    videoError.style.display = 'none';
                    openTab(null, 'tab4');
                }
            });
        });
    }, (error) => {
        console.error("Error fetching videos from Firestore: ", error);
        dashboardTableBody.innerHTML = '<tr><td colspan="4">Could not load video data.</td></tr>';
    });
};
    
    loadDashboard();

    const setButtonLoading = (button, isLoading, text) => {
        button.disabled = isLoading;
        button.textContent = text;
    };
    
    const showVideoError = (message) => {
        loader.style.display = 'none';
        videoError.textContent = 'Error: ' + message;
        videoError.style.display = 'block';
    }
});

function openTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).style.display = 'block';
    const targetButton = evt ? evt.currentTarget : document.querySelector(`.sidebar-nav button[onclick*="'${tabName}'"]`);
    if(targetButton) targetButton.classList.add('active');
}   