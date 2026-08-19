import type { FormEventHandler } from 'react'
import './GoToHeightForm.css'

interface GoToHeightFormProps {
  isValid: () => boolean
  goToHeightHandler: FormEventHandler<HTMLFormElement>
  goToHeightChangeHandle: FormEventHandler<HTMLInputElement>
  disabled?: boolean
}

export default function GoToHeightForm ({
  isValid,
  goToHeightHandler,
  goToHeightChangeHandle,
  disabled = false
}: GoToHeightFormProps) {
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
