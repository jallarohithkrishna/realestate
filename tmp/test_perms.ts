import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

async function testPermissions() {
    const configPath = path.resolve("./firebase-applet-config.json");
    console.log("Reading config from:", configPath);
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
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

testPermissions().catch(err => console.error("SCRIPT ERROR:", err));
