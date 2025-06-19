import React from "react";
import assets from "../assets/assets";

const RightSidebar = ({ selectedUser }) => {
  return (
    selectedUser && (
      <div
        className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${
          selectedUser ? "max-md:hidden" : ""
        }`}
      >
        {/* user icon & bio */}
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt="User-Avatar"
            className="w-20 aspect-square rounded-full"
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {selectedUser.fullName}
          </h1>
          <p className="px-10 mx-auto">{selectedUser.bio}</p>
        </div>

        {/* horizonatal line */}
        <hr className="border-[#ffffff50] my-4" />

        {/* media */}
        <div></div>
      </div>
    )
  );
};

export default RightSidebar;
