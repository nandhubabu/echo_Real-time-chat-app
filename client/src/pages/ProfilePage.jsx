import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, User, Mail, Pencil, Check, X, ArrowLeft, Info, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { getAvatarUrl, getDisplayName, handleAvatarError } from "../lib/utils";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { authUser, isUpdatingProfile, updateProfile, logout } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState(null);
    const displayName = getDisplayName(authUser);

    const [isEditingName, setIsEditingName] = useState(false);
    const [newUsername, setNewUsername] = useState(authUser?.username || "");

    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [newAbout, setNewAbout] = useState(authUser?.about || "");

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Image = reader.result;
            setSelectedImg(base64Image);
            await updateProfile({ profilePic: base64Image });
        };
    };

    const handleNameSave = async () => {
        if (!newUsername.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        if (newUsername === authUser.username) {
            setIsEditingName(false);
            return;
        }
        await updateProfile({ username: newUsername.trim() });
        setIsEditingName(false);
    };

    const handleAboutSave = async () => {
        if (newAbout === authUser.about) {
            setIsEditingAbout(false);
            return;
        }
        await updateProfile({ about: newAbout.trim() });
        setIsEditingAbout(false);
    };

    return (
        <div className="min-h-screen pt-20 pb-10">
            <div className="max-w-2xl mx-auto p-4 py-8">
                <div className="bg-base-300 rounded-xl p-6 space-y-8">
                    <div className="flex items-center justify-between">
                        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <div className="text-center flex-1">
                            <h1 className="text-2xl font-semibold">Profile</h1>
                        </div>
                        <div className="w-20 flex justify-end">
                            <button onClick={logout} className="btn btn-sm btn-outline btn-error gap-2 text-xs">
                                <LogOut className="size-3.5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <img
                                src={selectedImg || getAvatarUrl(authUser)}
                                alt="Profile"
                                className="size-32 rounded-full object-cover border-4 border-base-100"
                                onError={handleAvatarError}
                            />
                            <label
                                htmlFor="avatar-upload"
                                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "opacity-50 pointer-events-none" : ""}
                `}
                            >
                                <Camera className="w-5 h-5 text-base-200" />
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUpdatingProfile}
                                />
                            </label>
                        </div>
                        {authUser?.lastProfilePicUpdate && (
                            <p className="text-xs text-base-content/50">
                                Last updated: {new Date(authUser.lastProfilePicUpdate).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {/* User Info Section */}
                    <div className="space-y-6">
                        {/* Editable Username */}
                        <div className="space-y-1.5">
                            <div className="text-sm text-base-content/60 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Name
                            </div>
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="input input-bordered flex-1"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        autoFocus
                                        maxLength={30}
                                    />
                                    <button
                                        onClick={handleNameSave}
                                        className="btn btn-sm btn-success btn-circle"
                                        disabled={isUpdatingProfile}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { setNewUsername(authUser?.username || ""); setIsEditingName(false); }}
                                        className="btn btn-sm btn-ghost btn-circle"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between px-4 py-2.5 bg-base-200 rounded-lg border">
                                    <span>{displayName}</span>
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        className="btn btn-ghost btn-xs btn-circle"
                                        title="Edit name"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Editable About */}
                        <div className="space-y-1.5">
                            <div className="text-sm text-base-content/60 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                About
                            </div>
                            {isEditingAbout ? (
                                <div className="flex items-start gap-2">
                                    <textarea
                                        className="textarea textarea-bordered flex-1 h-20"
                                        value={newAbout}
                                        onChange={(e) => setNewAbout(e.target.value)}
                                        autoFocus
                                        maxLength={150}
                                        placeholder="Available"
                                    />
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={handleAboutSave}
                                            className="btn btn-sm btn-success btn-circle"
                                            disabled={isUpdatingProfile}
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { setNewAbout(authUser?.about || ""); setIsEditingAbout(false); }}
                                            className="btn btn-sm btn-ghost btn-circle"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between px-4 py-2.5 bg-base-200 rounded-lg border min-h-[3rem]">
                                    <span className="whitespace-pre-wrap flex-1 break-words">
                                        {authUser?.about || <span className="italic opacity-50">Hey there! I am using Echo.</span>}
                                    </span>
                                    <button
                                        onClick={() => setIsEditingAbout(true)}
                                        className="btn btn-ghost btn-xs btn-circle ml-2"
                                        title="Edit about"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email (Read-only) */}
                        <div className="space-y-1.5">
                            <div className="text-sm text-base-content/60 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                            </div>
                            <p className="px-4 py-2.5 bg-base-200 rounded-lg border text-base-content/80">
                                {authUser?.email}
                            </p>
                        </div>

                        {/* Username Handle (For sharing with friends) */}
                        <div className="space-y-1.5">
                            <div className="text-sm text-base-content/60 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Username Handle
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="px-4 py-2.5 bg-base-200 rounded-lg border font-semibold text-[#007AFF] flex-1">
                                    @{authUser?.username}
                                </p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`@${authUser?.username}`);
                                        toast.success("Username handle copied!");
                                    }}
                                    className="btn btn-sm btn-outline btn-primary h-[42px]"
                                    title="Copy Handle"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;
