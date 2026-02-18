import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

// Redirects logged-in faculty to their own FacultyProfile page
const MyProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const resolveProfile = async () => {
            try {
                // Use /auth/me to get the most up-to-date user info including facultyId
                const res = await authAPI.getMe();
                const me = res.data.user;

                if (me.facultyId) {
                    const id = typeof me.facultyId === 'object' ? me.facultyId._id : me.facultyId;
                    navigate(`/faculty/${id}`, { replace: true });
                } else if (me.facultyProfile?._id) {
                    navigate(`/faculty/${me.facultyProfile._id}`, { replace: true });
                } else {
                    // No faculty profile yet
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
