import "./go_to_height_form.css";

// import React, {useState} from 'react';

export default function GoToHeightForm({goToHeightHandler, goToHeightInputChangeHandle, searchedHeightCorrection}) {

    return (
        <form className='go_to_height_form' onSubmit={goToHeightHandler}>
            <div className='go_to_height_form__title'>Go to height</div>
            <input 
                className={searchedHeightCorrection ? 'go_to_height_form__input' : 'go_to_height_form__input  go_to_height_form__input--warning'}
                onInput={goToHeightInputChangeHandle}
                type='number'
                placeholder='Height'
            />
            <button className='go_to_height_form__button' disabled={!searchedHeightCorrection}>go</button>
        </form>
    );
}
