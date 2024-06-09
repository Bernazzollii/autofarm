import { auth, onAuthStateChanged, provider, signInWithPopup, signOut } from "./firebaseSDK.js";

const signInButton = document.getElementById('signInButton');
const signOutButton = document.getElementById('signOutButton');
const message = document.getElementById('message');

signOutButton.classList.add('hide');
message.classList.add('hide');


const userSignIn = async () => {
    await signInWithPopup(auth, provider).then((result) => {
        const user = result.user;
    }).catch((error) => {
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
    });
};

const userSignOut = async () => {
    await signOut(auth).then(() => {
    }).catch((error) => {
        console.log(error);
    });
};

// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         console.log("(´༎ຶ۝༎ຶ) -> user:", user);
//         console.log('User is signed in');
//         signInButton.classList.add('hide');
//         message.classList.remove('hide');
//         message.textContent = `Hello, ${user.displayName}`;
//         signOutButton.classList.remove('hide');

//     } else {
//         console.log('User is signed out');
//         message.classList.add('hide');
//         signInButton.classList.remove('hide');
//         signOutButton.classList.add('hide');
//     }
// });



const UserConected = new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            signInButton.classList.add('hide');
            message.classList.remove('hide');
            message.textContent = `Hello, ${user.displayName}`;
            signOutButton.classList.remove('hide');
            resolve(user);
        } else {
            message.classList.add('hide');
            signInButton.classList.remove('hide');
            reject('User not logged');
        }
    });
});


signInButton.addEventListener('click', userSignIn);
signOutButton.addEventListener('click', userSignOut);

export { UserConected };

