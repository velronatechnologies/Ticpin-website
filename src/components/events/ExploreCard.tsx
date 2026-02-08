export default function ExploreCard() {
  const gradientStyle = {
    background: 'linear-gradient(105.73deg, #866BFF -160.73%, #BDB1F3 93.19%)'
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {/* Music Card */}
      <div className="w-[173px] h-[232px] rounded-[30px] flex-shrink-0 overflow-hidden" style={gradientStyle}>
        <h1 className="text-center pt-5 text-2xl text-black">Music</h1>
        <div className="mt-4"></div>
        <img 
          src="/events/eventsmusic.png" 
          alt="Music" 
          className="w-[164px] h-[183px] ml-[40px] " 
        />
      </div>

      {/* Comedy Card */}
      <div className="w-[173px] h-[232px] rounded-[30px] flex-shrink-0 overflow-hidden" style={gradientStyle}>
        <h1 className="text-center pt-5 text-2xl text-black">Comedy</h1>
      
        <div className="mt-4"></div>
       
      </div>

      {/* Performance Card */}
      <div className="w-[173px] h-[232px] rounded-[30px] flex-shrink-0 overflow-hidden" style={gradientStyle}>
        <h1 className="text-center pt-5 text-2xl text-black">Performance</h1>
        <div className="mt-4"></div>
        <img 
          src="/events/eventperfomance.png" 
          alt="Performance" 
          className="w-[179px] h-[183px] ml-[16px] mt-[30px]" 
        />
      </div>

      {/* Sports Card */}
      <div className="w-[173px] h-[232px] rounded-[30px] flex-shrink-0 overflow-hidden" style={gradientStyle}>
        <h1 className="text-center pt-5 text-2xl text-black">Sports</h1>
        <div className="mt-4"></div>
        <img 
          src="/events/eventssports.png" 
          alt="Sports" 
          className="w-[179px] h-[183px] ml-[30px]  mt-[35px]" 
        />
      </div>
    </div>
  );
}
