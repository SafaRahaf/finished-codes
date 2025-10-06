import React from 'react'

const EventCard = ({ color, title, date, hijriDate, time }) => {
    return (
        <div className='bg-white rounded-[4px] mb-2 px-4 py-2' style={{ borderLeft: "16px solid " + color }}>
            <h3 className='text-lg font-normal mb-1'>
                {title}
            </h3>
            <p className='text-sm'>
                {date} | {hijriDate} | {time}
            </p>
        </div>
    )
}

export default EventCard