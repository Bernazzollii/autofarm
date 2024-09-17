import { auth, onAuthStateChanged, provider, signInWithPopup, signOut } from "./firebaseSDK.js";

const signInButton = document.getElementById('signInButton');
const signOutButton = document.getElementById('signOutButton');
const message = document.getElementById('message');
const UserConected = connectUser();

async function connectUser() {
    new Promise((resolve, reject) => {
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
};

const userSignIn = async () => {
    await signInWithPopup(auth, provider).then((result) => {
        const user = result.user;
        // connectUser();
        location.reload();
        setTimeout(() => {
        }, 1000);
    }).catch((error) => {
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
    });
};

const userSignOut = async () => {
    await signOut(auth).then(() => {
        location.reload();
    }).catch((error) => {
        console.log(error);
    });
};

signInButton.addEventListener('click', userSignIn);
signOutButton.addEventListener('click', userSignOut);

export { onAuthStateChanged, UserConected };

