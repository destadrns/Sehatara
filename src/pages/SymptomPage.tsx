import { AlertTriangle } from 'lucide-react'
import FocusPanel from '../components/common/FocusPanel'
import PageHero from '../components/common/PageHero'
import { getUiCopy } from '../i18n/uiCopy'
import type {
  FeatureConfig,
  LanguageMode,
  PageId,
  SaveMedicineNoteInput,
  SavedSymptomRecord,
  SaveSymptomRecordInput,
  SaveWellnessPlanInput,
} from '../types/sehatara'
import SymptomHistoryPanel from './symptom/SymptomHistoryPanel'
import SymptomInputForm from './symptom/SymptomInputForm'
import SymptomResultPanel from './symptom/SymptomResultPanel'
import { useSymptomWorkspace } from './symptom/useSymptomWorkspace'

type SymptomPageProps = {
  feature: FeatureConfig
  language: LanguageMode
  onNavigate: (page: PageId) => void
  onClearSymptomRecords: () => void
  onDeleteSymptomRecord: (id: string) => void
  onSaveMedicineNote: (note: SaveMedicineNoteInput) => void
  onSaveSymptomRecord: (record: SaveSymptomRecordInput) => void
  onSaveWellnessPlan: (plan: SaveWellnessPlanInput) => void
  savedRecords: SavedSymptomRecord[]
}

function SymptomPage({
  feature,
  language,
  onNavigate,
  onClearSymptomRecords,
  onDeleteSymptomRecord,
  onSaveMedicineNote,
  onSaveSymptomRecord,
  onSaveWellnessPlan,
  savedRecords,
}: SymptomPageProps) {
  const copy = getUiCopy(language).symptom
  const workspace = useSymptomWorkspace(language)

  function handleAnalyze() {
    void workspace.runAnalysis(onSaveSymptomRecord)
  }

  function saveToMedicine() {
    if (!workspace.medicineHandoff) {
      return
    }

    onSaveMedicineNote(workspace.medicineHandoff)
    onNavigate('medicine')
  }

  function saveToWellnessPlan() {
    onSaveWellnessPlan(workspace.wellnessHandoff)
    onNavigate('preventive')
  }

  return (
    <main className="feature-page symptom-page" data-accent={feature.accent}>
      <PageHero feature={feature} language={language} onNavigate={onNavigate} />

      {workspace.isUrgent && (
        <section className="urgent-banner" role="alert">
          <AlertTriangle size={18} />
          <span>{copy.urgentBanner}</span>
        </section>
      )}

      <section className="tool-layout symptom-workspace-layout">
        <SymptomInputForm
          language={language}
          symptomText={workspace.symptomText}
          areas={workspace.areas}
          duration={workspace.duration}
          intensity={workspace.intensity}
          activeFlags={workspace.activeFlags}
          formError={workspace.formError}
          isAnalyzing={workspace.isAnalyzing}
          hasWorkspaceContent={workspace.hasWorkspaceContent}
          symptomOptions={workspace.symptomOptions}
          onSymptomTextChange={workspace.updateSymptomText}
          onAreaToggle={workspace.toggleArea}
          onDurationChange={workspace.updateDuration}
          onIntensityChange={workspace.updateIntensity}
          onFlagToggle={workspace.toggleFlag}
          onAnalyze={handleAnalyze}
          onClear={workspace.clearWorkspace}
        />

        <SymptomResultPanel
          language={language}
          hasResult={workspace.hasResult}
          hasWorkspaceContent={workspace.hasWorkspaceContent}
          isUrgent={workspace.isUrgent}
          hasChestArea={workspace.hasChestArea}
          intensity={workspace.intensity}
          duration={workspace.duration}
          areaLabel={workspace.areaLabel}
          analysisResult={workspace.analysisResult}
          medicineHandoff={workspace.medicineHandoff}
          onClearWorkspace={workspace.clearWorkspace}
          onSaveToMedicine={saveToMedicine}
          onSaveToWellnessPlan={saveToWellnessPlan}
        />

        <SymptomHistoryPanel
          language={language}
          savedRecords={savedRecords}
          onDeleteRecord={onDeleteSymptomRecord}
          onClearRecords={onClearSymptomRecords}
        />

        <div className="symptom-focus-slot">
          <FocusPanel feature={feature} language={language} />
        </div>
      </section>
    </main>
  )
}

export default SymptomPage
