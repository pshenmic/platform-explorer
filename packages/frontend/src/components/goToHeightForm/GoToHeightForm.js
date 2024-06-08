import './GoToHeightForm.scss'

export default function GoToHeightForm ({ isValid, goToHeightHandler, goToHeightChangeHandle, disabled = false }) {
  return (
    <form className={'GoToHeightForm'} onSubmit={goToHeightHandler}>
        <div className={'GoToHeightForm__Title'}>Go to height</div>
        <input
            className={isValid() ? 'GoToHeightForm__Input' : 'GoToHeightForm__Input  GoToHeightForm__Input--Incorrect'}
            onInput={goToHeightChangeHandle}
            type='number'
            placeholder='Height'
            disabled={disabled}
        />
        <button className={'GoToHeightForm__Button'} disabled={!isValid() || disabled}>go</button>
    </form>
  )
}
