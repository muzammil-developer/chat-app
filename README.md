# Real-Time Chat Application 💬

A simple, responsive, and real-time private chat application built using **HTML, CSS, Bootstrap, JavaScript, and Firebase**.

This project allows registered users to communicate with each other through private conversations with real-time message updates.

## 🚀 Features

- **User Authentication:** Secure signup and login using Firebase Authentication.
- **User Registration:** Create an account with a username, email, and password.
- **Users List:** View all registered users, including your own account.
- **Private Chat:** Start a private conversation by selecting a user.
- **Real-Time Messaging:** Send and receive messages instantly.
- **Message Timestamps:** Display the time each message was sent.
- **Delete Messages:** Delete your own sent messages.
- **Responsive Design:** Simple and user-friendly interface.

## 🛠️ Technologies Used

- HTML5
- CSS3
- Bootstrap 5
- JavaScript (ES6 Modules)
- Firebase Authentication
- Firebase Realtime Database

## 📂 Project Structure

```text
Chat-App/
│
├── index.html
├── signup.html
├── dashboard.html
├── style.css
├── index.js
└── firebase.config.js
```

## 🔥 Firebase Integration

This project uses Firebase for authentication and real-time database functionality.

**Firebase Authentication**
- Handles user registration.
- Handles user login.
- Manages authenticated user sessions.

**Firebase Realtime Database**
- Stores registered users' profiles.
- Stores private conversations.
- Synchronizes messages in real time.
- Supports message deletion.

## ⚙️ Installation & Setup

1. Clone this repository:

```bash
git clone https://github.com/muzammil-developer/chat-app/tree/main
```

2. Open the project folder in Visual Studio Code.

3. Create a Firebase project in the Firebase Console.

4. Enable:
   - Email/Password Authentication
   - Firebase Realtime Database

5. Add your Firebase project configuration inside `firebase.config.js`.

6. Configure your Realtime Database security rules.

7. Run the project using the **Live Server** extension in VS Code.

## 💡 What I Learned

While building this project, I practiced:

- Firebase Authentication integration.
- Firebase Realtime Database operations.
- JavaScript ES6 modules and asynchronous functions.
- Real-time data synchronization using database listeners.
- Sending, receiving, and deleting messages.
- Managing user sessions.
- Building interactive and responsive web interfaces.

## 👨‍💻 Developer

**Muzammil Hussain**

Frontend Developer

## 📄 License

This project was created for learning and educational purposes.
