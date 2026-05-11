const fs = require('fs');
const path = 'src/app/play/create/format/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<label className="text-[25px] font-medium text-[#686868]">End time</label>`;
const startIndex = content.indexOf(targetStr);
const endPattern = `</div>\n                                </div>\n                            </div>`;
const endIndex = content.indexOf(endPattern, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `<label className="text-[25px] font-medium text-[#686868]">End time</label>
                                    <div className="relative w-full">
                                        <div 
                                            onClick={() => setOpenDropdown(openDropdown === 'end' ? null : 'end')}
                                            className="border border-[#686868] rounded-[10px] h-[64px] flex items-center justify-between px-6 cursor-pointer bg-transparent"
                                        >
                                            <span className="text-[25px] text-[#686868] select-none">{endTime}</span>
                                            <ChevronDown size={20} className={\`text-black transition-transform \${openDropdown === 'end' ? 'rotate-180' : ''}\`} />
                                        </div>
                                        {openDropdown === 'end' && (
                                            <div className="absolute top-full mt-2 w-full bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg z-50 max-h-[300px] overflow-y-auto">
                                                {Array.from({ length: 24 }).map((_, i) => {
                                                    const time = \`\${i.toString().padStart(2, '0')}:00\`;
                                                    return (
                                                        <div 
                                                            key={time} 
                                                            onClick={() => { setEndTime(time); setOpenDropdown(null); }}
                                                            className="px-6 py-3 hover:bg-gray-100 cursor-pointer text-[20px] text-black"
                                                        >
                                                            {time}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>`;
    
    content = content.substring(0, startIndex) + replacement + content.substring(endIndex + endPattern.length);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Fixed End Time dropdown');
} else {
    console.log('Could not find target strings');
}
