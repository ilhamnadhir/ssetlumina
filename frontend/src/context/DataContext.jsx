import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { facultyAPI, departmentsAPI } from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [departments, setDepartments] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    const refreshData = useCallback(async (force = false) => {
        if (!force && initialized) return;

        setLoading(true);
        setError(null);
        try {
            const [deptsRes, facultyRes] = await Promise.all([
                departmentsAPI.getAll(),
                facultyAPI.getAll({ minimal: true })
            ]);

            setDepartments(deptsRes.data.departments || deptsRes.data || []);
            setFacultyList(facultyRes.data.faculty || facultyRes.data || []);
            setInitialized(true);
        } catch (err) {
            console.error('Error fetching global data:', err);
            setError('Failed to load shared data');
        } finally {
            setLoading(false);
        }
    }, [initialized]);

    // Initial load
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const value = {
        departments,
        facultyList,
        loading,
        error,
        refreshData,
        initialized
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
