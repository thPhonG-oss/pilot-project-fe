import { useTranslation } from "react-i18next";


type ProjectFormPageProps = { mode: 'create' | 'edit'}

export function ProjectFormPage({ mode }: ProjectFormPageProps) {
    const { t } = useTranslation()
    return (
        <div>
            <h1>{mode === 'create' ? t('project.newTitle') : t('project.editTitle')}</h1>
        </div>
    )
}
