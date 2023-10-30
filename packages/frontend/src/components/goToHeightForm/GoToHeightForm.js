import "./GoToHeightForm.scss";

// import React, {useState} from 'react';

export default function GoToHeightForm({goToHeightHandler, goToHeightChangeHandle, heightCorrection}) {

    return (
        <form className='GoToHeightForm' onSubmit={goToHeightHandler}>
            <div className='GoToHeightForm__Title'>Go to height</div>
            <input 
                className={heightCorrection ? 'GoToHeightForm__Input' : 'GoToHeightForm__Input  GoToHeightForm__Input--Incorrect'}
                onInput={goToHeightChangeHandle}
                type='number'
                placeholder='Height'
            />
            <button className='GoToHeightForm__Button' disabled={!heightCorrection}>go</button>
        </form>
    );
}
