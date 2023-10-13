import "./go_to_height_form.css";

// import React, {useState} from 'react';

export default function GoToHeightForm({goToHeightHandler, goToHeightChangeHandle, heightCorrection}) {

    return (
        <form className='go_to_height_form' onSubmit={goToHeightHandler}>
            <div className='go_to_height_form__title'>Go to height</div>
            <input 
                className={heightCorrection ? 'go_to_height_form__input' : 'go_to_height_form__input  go_to_height_form__input--incorrect'}
                onInput={goToHeightChangeHandle}
                type='number'
                placeholder='Height'
            />
            <button className='go_to_height_form__button' disabled={!heightCorrection}>go</button>
        </form>
    );
}
