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
            // If user already has facultyId stored, navigate directly
            if (user?.facultyId) {
                const id = typeof user.facultyId === 'object' ? user.facultyId._id : user.facultyId;
                navigate(`/faculty/${id}`, { replace: true });
                return;
            }

            // Otherwise look up faculty by userId via API
            try {
                const res = await facultyAPI.getAll();
                const match = res.data.faculty.find(f => f.userId === user?._id || f.userId?._id === user?._id);
                if (match) {
                    navigate(`/faculty/${match._id}`, { replace: true });
                } else {
                    // Faculty profile not created yet — go to faculty directory
                    navigate('/faculty', { replace: true });
                }
            } catch {
                navigate('/faculty', { replace: true });
            }
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
