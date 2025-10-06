import React from 'react'

const HifzModal = ({ setHifz }) => {
    return (
        <>
            <div className="onboarding-profile-bg" onClick={() => setHifz(false)}></div>
            <div className="card lg:w-[750px] w-[95%] max-w-[95%] p-12 rounded-[12px] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[9999999] shadow-lg bg-white m-auto mt-8">
                <h2 className='text-[30px] font-bold'>Hifz Module</h2>
                <div className="line h-[1px] w-full bg-[#E4E6EA] mt-6 mb-4">
                </div>
                <p>
                    The Hifz module (as a subject) has been automatically added. And it was assigned to the homeroom teacher (you can change teacher later). The Hifz module's progress input system includes the following features:
                </p>
                <div className="tags flex my-4 justify-start items-center gap-2">
                    <div className="tag bg-[#E7F7FF] text-[#5C5D61] px-3 py-1 rounded-[4px]">Daily Sabaq</div>
                    <div className="tag bg-[#E7F7FF] text-[#5C5D61] px-3 py-1 rounded-[4px]">Sabaq Juz</div>
                    <div className="tag bg-[#E7F7FF] text-[#5C5D61] px-3 py-1 rounded-[4px]">Juz Test</div>
                    <div className="tag bg-[#E7F7FF] text-[#5C5D61] px-3 py-1 rounded-[4px]">Manzil</div>
                    <div className="tag bg-[#E7F7FF] text-[#5C5D61] px-3 py-1 rounded-[4px]">Nazera/Tilawat</div>
                </div>
                <p>
                    There are two methods for recording Hifz progress: <b>by Juz and by Surah</b>. Each method allows for detailed tracking.
                </p>
                <p>
                    Both you and the teacher can modify this setting later if needed, allowing for flexible and detailed tracking of student progress.
                </p>

                <div className="flex justify-end mt-8">
                    <button className="btn bg-black block mx-auto text-white w-[60%] min-w-[300px] py-3 rounded-md text-lg font-bold" onClick={() => setHifz(false)}>Okay, Understood</button>
                </div>
            </div>
        </>
    )
}

export default HifzModal;