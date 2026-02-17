import React, { memo, useState, useEffect } from "react";
import {
  Users,
  Heart,
  Share2,
  MessageCircle,
  ChevronRight,
  Plus,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  ArrowRight
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { usersAPI } from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const ConnectionsSection = memo(({ fullPage = false }) => {
  const { user } = useUser();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConnections();
  }, [user?._id]);

  const loadConnections = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      setError(null);

      const [followersData, followingData] = await Promise.all([
        usersAPI.getFollowers(user._id),
        usersAPI.getFollowing(user._id),
      ]);

      const transformedFollowers = followersData.followers.map((follower) => ({
        id: follower._id,
        name: follower.name,
        title: follower.skillsToTeach?.[0]?.name || "Learner",
        avatar: follower.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.name)}&background=7c3aed&color=fff`,
        isFollowing: user.following?.includes(follower._id) || false,
      }));

      const transformedFollowing = followingData.following.map((followedUser) => ({
        id: followedUser._id,
        name: followedUser.name,
        title: followedUser.skillsToTeach?.[0]?.name || "Mentor",
        avatar: followedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(followedUser.name)}&background=10b981&color=fff`,
        isMutual: user.followers?.includes(followedUser._id) || false,
      }));

      setFollowers(transformedFollowers);
      setFollowing(transformedFollowing);
    } catch (err) {
      console.error("Error loading connections:", err);
      setError("Synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try { await usersAPI.follow(userId); await loadConnections(); } catch (err) {}
  };

  const handleUnfollow = async (userId) => {
    try { await usersAPI.unfollow(userId); await loadConnections(); } catch (err) {}
  };

  const stats = [
    { label: "Followers", value: followers.length, color: "bg-primary/10 text-primary" },
    { label: "Following", value: following.length, color: "bg-secondary/10 text-secondary" },
    { label: "Mutuals", value: followers.filter((f) => f.isFollowing).length, color: "bg-accent/10 text-accent" },
  ];

  return (
    <div className={fullPage ? "space-y-12" : "space-y-8"}>
      {/* Network Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-4 text-center bg-white border border-border rounded-2xl group hover:shadow-lg transition-all">
             <div className={`w-8 h-8 ${stat.color} mx-auto mb-2 rounded-lg flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform`}>
                {stat.label === "Mutuals" ? <LinkIcon className="w-4 h-4" /> : <Users className="w-4 h-4" />}
             </div>
             <p className="text-xl font-black text-text-main">{stat.value}</p>
             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Followers Block */}
      <div>
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-black text-text-main tracking-tight uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              Followers
           </h3>
           <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{followers.length} Total</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : followers.length === 0 ? (
          <div className="p-10 text-center bg-bg-alt rounded-[32px] border-2 border-dashed border-border group hover:border-primary/20 transition-all">
            <Sparkles className="w-10 h-10 text-text-muted/20 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-black text-text-muted tracking-widest uppercase">No connections yet</p>
          </div>
        ) : (
          <div className={`grid ${fullPage ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
             <AnimatePresence>
               {followers.slice(0, fullPage ? 12 : 3).map((person, i) => (
                 <motion.div
                   key={person.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   className="p-5 bg-white border border-border rounded-3xl flex items-center justify-between group hover:shadow-xl transition-all"
                 >
                   <div className="flex items-center space-x-4">
                      <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <div>
                         <h4 className="font-black text-text-main text-sm">{person.name}</h4>
                         <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{person.title}</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => person.isFollowing ? handleUnfollow(person.id) : handleFollow(person.id)}
                        className={`p-3 rounded-xl transition-all ${person.isFollowing ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-bg-alt text-text-muted hover:text-primary'}`}
                      >
                         <Heart className={`w-4 h-4 ${person.isFollowing ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-3 bg-bg-alt text-text-muted rounded-xl hover:text-secondary transition-all">
                         <MessageCircle className="w-4 h-4" />
                      </button>
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        )}
      </div>

      {/* Following Block (Abbreviated for Overview) */}
      {!fullPage && following.length > 0 && (
         <div className="pt-4">
            <button className="w-full py-4 bg-bg-alt text-text-muted rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-primary border border-transparent hover:border-border transition-all">
               View {following.length} Following
            </button>
         </div>
      )}

      {fullPage && following.length > 0 && (
         <div>
            <div className="flex items-center justify-between mb-6 mt-12">
               <h3 className="text-xl font-black text-text-main tracking-tight uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  Following
               </h3>
               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{following.length} Total</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {following.map((person, i) => (
                 <div key={person.id} className="p-5 bg-white border border-border rounded-3xl flex items-center justify-between group hover:shadow-xl transition-all">
                   <div className="flex items-center space-x-4">
                      <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <div>
                         <div className="flex items-center gap-2">
                            <h4 className="font-black text-text-main text-sm">{person.name}</h4>
                            {person.isMutual && <LinkIcon className="w-3 h-3 text-secondary" />}
                         </div>
                         <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{person.title}</p>
                      </div>
                   </div>
                   <button onClick={() => handleUnfollow(person.id)} className="px-4 py-2 bg-bg-alt text-text-muted text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-red-500 hover:bg-red-50 transition-all">
                      Unfollow
                   </button>
                 </div>
               ))}
            </div>
         </div>
      )}

      {fullPage && (
        <button className="w-full py-5 mt-12 border-2 border-border border-dashed rounded-[32px] text-xs font-black text-text-muted hover:border-primary hover:text-primary transition-all uppercase tracking-widest flex items-center justify-center gap-2">
          <span>Search for new Mentors</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

ConnectionsSection.displayName = "ConnectionsSection";

export default ConnectionsSection;
