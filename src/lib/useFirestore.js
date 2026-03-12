import { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
    collection, 
    onSnapshot, 
    doc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy 
} from 'firebase/firestore';

export function useFirestoreProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProjects(projectsData);
            setLoading(false);
        }, (error) => {
            console.error("Projeler getirilirken hata:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addProject = async (project) => {
        try {
            // Include a timestamp for ordering
            const projectData = {
                ...project,
                createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'projects', project.id.toString()), projectData);
        } catch (error) {
            console.error("Proje eklenirken hata:", error);
        }
    };

    const updateProject = async (id, updatedData) => {
        try {
            await updateDoc(doc(db, 'projects', id.toString()), updatedData);
        } catch (error) {
            console.error("Proje güncellenirken hata:", error);
        }
    };

    const deleteProject = async (id) => {
        try {
            await deleteDoc(doc(db, 'projects', id.toString()));
        } catch (error) {
            console.error("Proje silinirken hata:", error);
        }
    };

    return { projects, loading, addProject, updateProject, deleteProject };
}

export function useFirestoreActivities() {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activitiesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActivities(activitiesData);
        }, (error) => {
            console.error("Aktiviteler getirilirken hata:", error);
        });

        return () => unsubscribe();
    }, []);

    const addActivity = async (activity) => {
        try {
            const activityId = Date.now().toString();
            const activityData = {
                ...activity,
                timestamp: new Date().toISOString()
            };
            await setDoc(doc(db, 'activities', activityId), activityData);
        } catch (error) {
            console.error("Aktivite eklenirken hata:", error);
        }
    };

    return { activities, addActivity };
}
