import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { facultyAPI } from '../services/api';

// Redirects logged-in faculty to their own FacultyProfile page
const MyProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const resolveProfile = async () => {
            try {
                // Direct lookup by userId on the backend — most reliable
                const res = await facultyAPI.getMe();
                const faculty = res.data.faculty;
                if (faculty?._id) {
                    navigate(`/faculty/${faculty._id}`, { replace: true });
                    return;
                }
            } catch {
                // 404 means no faculty profile exists yet
            }
            // No faculty profile — go to faculty directory
            navigate('/faculty', { replace: true });
        };

        if (user) resolveProfile();
    }, [user, navigate]);

    return (
        <div className="loading-container">
            <div className="loader"></div>
        </div>
    );
};

export default MyProfile;
