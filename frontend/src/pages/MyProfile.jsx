import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, facultyAPI } from '../services/api';

// Redirects logged-in faculty to their own FacultyProfile page
const MyProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const resolveProfile = async () => {
            try {
                // Strategy 1: use /auth/me to get fresh user data with facultyId
                const res = await authAPI.getMe();
                const me = res.data.user;

                if (me.facultyId) {
                    const id = typeof me.facultyId === 'object' ? me.facultyId._id || me.facultyId : me.facultyId;
                    navigate(`/faculty/${id}`, { replace: true });
                    return;
                }

                if (me.facultyProfile?._id) {
                    navigate(`/faculty/${me.facultyProfile._id}`, { replace: true });
                    return;
                }

                // Strategy 2: search all faculty for one whose userId matches
                const userId = me.id || me._id;
                if (userId) {
                    const allRes = await facultyAPI.getAll();
                    const allFaculty = allRes.data.faculty || [];
                    const match = allFaculty.find(f => {
                        const fUserId = f.userId?._id || f.userId;
                        return fUserId && fUserId.toString() === userId.toString();
                    });
                    if (match) {
                        navigate(`/faculty/${match._id}`, { replace: true });
                        return;
                    }
                }

                // No faculty profile found yet
                navigate('/faculty', { replace: true });
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
