import { Grid, Input, Stack } from '@chakra-ui/react'
import { Label } from '@components/ui/forms'

import { DATA_CONTRACT_FIELDS_ENUM as TYPE } from './constants'

import styles from './OptionalFieldsGrid.module.scss'

const StringField = () => (
  <>
    <Grid templateColumns="1fr 1fr" gap={6}>
      <Label className={styles.label} label="Min Length">
        <Input placeholder="Minimal..." />
      </Label>
      <Label className={styles.label} label="Max Length">
        <Input placeholder="Maximum..." />
      </Label>
    </Grid>
    <Stack mt={6} gap={6}>
      <Label className={styles.label} label="RE2 Pattern">
        <Input placeholder="Pattern RE2 (Regular expression syntax)..." />
      </Label>
      <Label className={styles.label} label="Format">
        <Input placeholder="Format Specifications (email, uri etc.)..." />
      </Label>
      <Label className={styles.label} label="Description ">
        <Input placeholder="Description Text ..." />
      </Label>
      <Label className={styles.label} label="Comment">
        <Input className={styles.label} placeholder="Comment Text ..." />
      </Label>
    </Stack>
  </>
)

const IntegerField = () => (
  <>
    <Grid templateColumns="1fr 1fr" gap={6}>
      <Label className={styles.label} label="Minimum">
        <Input placeholder="Minimum..." />
      </Label>
      <Label className={styles.label} label="Maximum">
        <Input placeholder="Maximum..." />
      </Label>
    </Grid>
    <Stack mt={6} gap={6}>
      <Label className={styles.label} label="Description ">
        <Input placeholder="Description Text ..." />
      </Label>
      <Label className={styles.label} label="Comment">
        <Input className={styles.label} placeholder="Comment Text ..." />
      </Label>
    </Stack>
  </>
)

const ArrayField = () => (
  <>
    <Grid templateColumns="1fr 1fr" gap={6}>
      <Label className={styles.label} label="Min items">
        <Input placeholder="Min..." />
      </Label>
      <Label className={styles.label} label="Max items">
        <Input placeholder="Max..." />
      </Label>
    </Grid>
    <Stack mt={6} gap={6}>
      <Label className={styles.label} label="Content media type">
        <Input placeholder="Content media type ..." />
      </Label>
      <Label className={styles.label} label="Description ">
        <Input placeholder="Description Text ..." />
      </Label>
      <Label className={styles.label} label="Comment">
        <Input className={styles.label} placeholder="Comment Text ..." />
      </Label>
    </Stack>
  </>
)

const ObjectField = () => (
  <>
    <Grid templateColumns="1fr 1fr" gap={6}>
      <Label className={styles.label} label="Min properties">
        <Input placeholder="Min..." />
      </Label>
      <Label className={styles.label} label="Max properties">
        <Input placeholder="Max..." />
      </Label>
    </Grid>
    <Stack mt={6} gap={6}>
      <Label className={styles.label} label="Description ">
        <Input placeholder="Description Text ..." />
      </Label>
      <Label className={styles.label} label="Comment">
        <Input className={styles.label} placeholder="Comment Text ..." />
      </Label>
    </Stack>
  </>
)

const NumberField = () => (
  <>
    <Grid templateColumns="1fr 1fr" gap={6}>
      <Label className={styles.label} label="Minimum">
        <Input placeholder="Min..." />
      </Label>
      <Label className={styles.label} label="MMaximum">
        <Input placeholder="Max..." />
      </Label>
    </Grid>
    <Stack mt={6} gap={6}>
      <Label className={styles.label} label="Description ">
        <Input placeholder="Description Text ..." />
      </Label>
      <Label className={styles.label} label="Comment">
        <Input className={styles.label} placeholder="Comment Text ..." />
      </Label>
    </Stack>
  </>
)

const BooleanField = () => (
  <Stack mt={6} gap={6}>
    <Label className={styles.label} label="Description ">
      <Input placeholder="Description Text ..." />
    </Label>
    <Label className={styles.label} label="Comment">
      <Input className={styles.label} placeholder="Comment Text ..." />
    </Label>
  </Stack>
)

export const OptionalFieldsGrid = ({ fieldType, ...props }) => {
  if (fieldType === TYPE.STRING) {
    return <StringField {...props} />
  }

  if (fieldType === TYPE.INTEGER) {
    return <IntegerField {...props} />
  }

  if (fieldType === TYPE.ARRAY) {
    return <ArrayField {...props} />
  }

  if (fieldType === TYPE.OBJECT) {
    return <ObjectField {...props} />
  }

  if (fieldType === TYPE.NUMBER) {
    return <NumberField {...props} />
  }

  if (fieldType === TYPE.BOOLEAN) {
    return <BooleanField {...props} />
  }

  return null
}
