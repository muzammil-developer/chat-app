import { auth, db } from "./firebase.config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
    ref,
    set,
    push,
    onValue,
    remove,
    get,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";


// Elements
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const errorMessage = document.getElementById("error-message");

const usersList = document.getElementById("users-list");
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatHeader = document.getElementById("chat-header");
const logoutBtn = document.getElementById("logout-btn");

let currentUser = null;
let selectedUser = null;

let stopUsersListener = null;
let stopMessagesListener = null;


// ---------------- SIGNUP ----------------

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const username = document
            .getElementById("username").value.trim();

        const email = document
            .getElementById("email").value.trim();

        const password = document
            .getElementById("password").value;

        errorMessage.textContent = "";

        try {

            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await set(ref(db, "users/" + result.user.uid), {

                username: username,
                email: email,
                uid: result.user.uid

            });

            window.location.href = "dashboard.html";

        } catch (error) {

            errorMessage.textContent = error.message;

        }

    });

}


// ---------------- LOGIN ----------------

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document
            .getElementById("email").value.trim();

        const password = document
            .getElementById("password").value;

        errorMessage.textContent = "";

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.href = "dashboard.html";

        } catch (error) {

            errorMessage.textContent = "Invalid email or password.";

        }

    });

}


// ---------------- AUTH STATE ----------------

// ---------------- AUTH STATE ----------------

onAuthStateChanged(auth, async (user) => {

    if (user) {

        currentUser = user;

        await ensureUserProfile(user);

        if (usersList) {
            loadUsers();
        }

        if (loginForm || signupForm) {
            window.location.href = "dashboard.html";
        }

    } else {

        if (usersList) {
            window.location.href = "index.html";
        }

    }

});

// ---------------- ENSURE USER PROFILE ----------------

async function ensureUserProfile(user) {

    const userRef = ref(db, "users/" + user.uid);

    try {

        const snapshot = await get(userRef);

        if (!snapshot.exists()) {

            const username = user.displayName ||
                user.email.split("@")[0];

            await set(userRef, {

                username: username,
                email: user.email,
                uid: user.uid

            });

            console.log("User profile created successfully!");

        }

    } catch (error) {

        console.log("Profile creation error:", error);

    }

}


// ---------------- LOAD USERS ----------------

function loadUsers() {

    if (stopUsersListener) {
        stopUsersListener();
    }

    stopUsersListener = onValue(ref(db, "users"), (snapshot) => {

        usersList.innerHTML = "";

        snapshot.forEach((child) => {

            const user = child.val();
            const uid = child.key;

            const button = document.createElement("button");

            button.className = "user-item";

            const name = document.createElement("strong");
            name.textContent = user.username || user.email;

            button.appendChild(name);

            // Identify your own account
            if (uid === currentUser.uid) {

                const you = document.createElement("small");
                you.textContent = " (You)";
                you.className = "you-label";

                button.appendChild(you);
            }

            if (selectedUser && selectedUser.uid === uid) {
                button.classList.add("active");
            }

            button.addEventListener("click", () => {

                document.querySelectorAll(".user-item").forEach((item) => {
                    item.classList.remove("active");
                });

                button.classList.add("active");

                openChat(uid, user);

            });

            usersList.appendChild(button);

        });

    });

}


// ---------------- CONVERSATION ID ----------------

function getConversationPath(uid1, uid2) {

    const sortedUIDs = [uid1, uid2].sort();

    return `conversations/${sortedUIDs[0]}/${sortedUIDs[1]}/messages`;

}


// ---------------- OPEN CHAT ----------------

function openChat(uid, user) {

    selectedUser = {
        uid: uid,
        ...user
    };

    // Stop previous chat listener
    if (stopMessagesListener) {
        stopMessagesListener();
        stopMessagesListener = null;
    }

    chatBox.innerHTML = "";

    // Chat heading
    chatHeader.innerHTML = "";

    const heading = document.createElement("h5");

    heading.textContent = user.username || user.email;

    chatHeader.appendChild(heading);

    // Enable message input
    messageInput.disabled = false;

    document.getElementById("send-btn").disabled = false;

    const messagesRef = ref(
        db,
        getConversationPath(currentUser.uid, selectedUser.uid)
    );

    // Real-time messages
    stopMessagesListener = onValue(messagesRef, (snapshot) => {

        chatBox.innerHTML = "";

        snapshot.forEach((child) => {

            const data = child.val();

            const messageKey = child.key;

            const messageDiv = document.createElement("div");

            messageDiv.className = "user-message";

            // Own message
            if (data.senderId === currentUser.uid) {
                messageDiv.classList.add("my-message");
            }

            // Message text
            const messageText = document.createElement("div");

            messageText.textContent = data.message;

            messageDiv.appendChild(messageText);


            // Message time
            const time = document.createElement("small");

            time.className = "message-time";

            if (typeof data.timestamp === "number") {

                time.textContent = new Date(
                    data.timestamp
                ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });

            } else {

                time.textContent = "Sending...";

            }

            messageDiv.appendChild(time);


            // Delete own message
            if (data.senderId === currentUser.uid) {

                const deleteButton = document.createElement("button");

                deleteButton.className = "delete-btn";

                deleteButton.textContent = "Delete";

                deleteButton.addEventListener("click", () => {

                    deleteMessage(messageKey);

                });

                messageDiv.appendChild(deleteButton);

            }

            chatBox.appendChild(messageDiv);

        });

        chatBox.scrollTop = chatBox.scrollHeight;

    });

}


// ---------------- SEND MESSAGE ----------------

if (chatForm) {

    chatForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const message = messageInput.value.trim();

        if (!message || !selectedUser || !currentUser) {
            return;
        }

        const messagesRef = ref(
            db,
            getConversationPath(currentUser.uid, selectedUser.uid)
        );

        try {

            await push(messagesRef, {

                message: message,

                senderId: currentUser.uid,

                receiverId: selectedUser.uid,

                timestamp: serverTimestamp()

            });

            messageInput.value = "";

        } catch (error) {

            console.log("Message sending error:", error);

        }

    });

}


// ---------------- DELETE MESSAGE ----------------

async function deleteMessage(messageKey) {

    if (!selectedUser) return;

    const messageRef = ref(
        db,
        getConversationPath(currentUser.uid, selectedUser.uid)
        + "/" + messageKey
    );

    try {

        const snapshot = await get(messageRef);

        if (
            snapshot.exists() &&
            snapshot.val().senderId === currentUser.uid
        ) {

            await remove(messageRef);

        }

    } catch (error) {

        console.log("Delete error:", error);

    }

}


// ---------------- LOGOUT ----------------

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            if (stopUsersListener) stopUsersListener();

            if (stopMessagesListener) stopMessagesListener();

            await signOut(auth);

            window.location.href = "index.html";

        } catch (error) {

            console.log("Logout error:", error);

        }

    });

}