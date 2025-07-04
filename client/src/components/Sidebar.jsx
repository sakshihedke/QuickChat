import { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'
const Sidebar = () => {
  const {getUser, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages} = useContext(ChatContext);
  const {logout, onlineUsers} = useContext(AuthContext)
  
  const [input , setInput] = useState(false);

  const navigate = useNavigate();

  const filteredUsers = input ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;
  
  useEffect(() => {
  console.log("UnseenMessages keys:", Object.keys(unseenMessages));
  users.forEach(user => {
    console.log("Comparing:", user._id, unseenMessages[user._id]);
  });
}, [unseenMessages, users]);

  useEffect(() => {getUser()}, [onlineUsers])
  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden":''}`}>
        <div className='pb-5 '>
            <div className='flex justify-between items-center'>
              <img src={assets.logo} alt="logo" className='max-w-40' /> 
              <div className='relative py-2 group'>
                <img src={assets.menu_icon} alt="Menu" className='max-h-5 cursor-pointer' />
                <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
                  <p onClick={() => navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
                  <hr className='my-2 border-t border-gray-500'/>
                  <p onClick={() => logout()} className='cursor-pointer text-sm'>Logout</p>
                </div>
              </div>
            </div>
          
          {/* Search bar */}
          <div className='bg-[#30294d] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
            <img src={assets.search_icon} alt="Search" className='w-3' />
            <input onChange={(e) => setInput(e.target.value)} type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search User...'/>
          </div>
        </div>

        {/* Users list */}
        <div className='flex flex-col'>
          {filteredUsers.map((user, index)=>(
            <div onClick={() => {setSelectedUser(user); setUnseenMessages(prev => ({...prev, [user._id]: 0}))}} key = {user._id} className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}>
              {/* User profile picture */}
              <img src={user?.profilePic || assets.avatar_icon} alt="" 
              className='w-[35px] aspect-[1/1] rounded-full'/>
              {/* User name */}
              <div className='flex flex-col leading-5'>
                <p className='text-sm'>{user?.fullName}</p>
                { 
                  onlineUsers.includes(user._id)
                  ? <span className='text-green-400 text-xs' >Online</span>
                  : <span className='text-neutral-400 text-xs'>Offline</span>
                }
              </div>
              {unseenMessages?.[user._id] > 0 && (
                <div className="absolute top-2 right-3 bg-purple-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 flex justify-center items-center rounded-full shadow-md">
                  {unseenMessages[user._id]}
                </div>
)}

            </div>
          ))} 
        </div>
    </div>
  )
}

export default Sidebar