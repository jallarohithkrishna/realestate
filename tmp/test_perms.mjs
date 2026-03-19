import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";

async function testPermissions() {
    const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
    const app = initializeApp(config);
    const db = getFirestore(app, config.firestoreDatabaseId);

    console.log("Testing write to 'appointments' collection...");
    try {
        const docRef = await addDoc(collection(db, "appointments"), {
            test: "perm_check",
            createdAt: new Date().toISOString()
        });
        console.log("SUCCESS! Created document with ID:", docRef.id);
    } catch (err) {
        console.error("FAILURE:", err.message);
    }
}

testPermissions();
