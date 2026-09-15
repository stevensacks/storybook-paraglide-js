import React, {useState} from 'react';
import type {FC} from 'react';
import {m} from '../paraglide/messages';

const Test: FC = () => {
    const [count, setCount] = useState(0);

    const onClick = () => setCount((count) => count + 1);

    return (
        <div>
            <span>{m.hello()}</span> <span>{m.world()}</span>
            <div style={{marginTop: '1rem'}}>
                <button onClick={onClick}>{m.click({count})}</button>
            </div>
        </div>
    );
};

export default Test;
