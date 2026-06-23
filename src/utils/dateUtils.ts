export function formatProjectDate(value?: string | null) {
    if (!value) {
      return ''
    }

    const [year, month, day] = value.split('-')

    if (!year || !month || !day) {
      return value
    }

    return `${day}.${month}.${year}`
  }
