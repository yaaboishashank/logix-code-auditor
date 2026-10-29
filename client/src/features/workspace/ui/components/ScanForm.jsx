import { useForm } from "react-hook-form";
import { Link } from "react-router";
import Button from "../../../../shared/ui/components/Button";

const ScanForm = ({ onStart, isRunning }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      repositoryUrl: "",
      branch: "",
    },
  });

  const disabled = isRunning || isSubmitting;

  return (
    <form
      id="scan-form"
      className="scan-form"
      onSubmit={handleSubmit(onStart)}
      noValidate
    >
      <label className="scan-field">
        <span>GitHub repository URL</span>

        <input
          type="url"
          placeholder="https://github.com/owner/repository"
          disabled={disabled}
          aria-invalid={Boolean(errors.repositoryUrl)}
          aria-describedby={
            errors.repositoryUrl ? "repository-error" : undefined
          }
          {...register("repositoryUrl", {
            setValueAs: (value) => value.trim(),
            required: "Enter a repository URL.",
            maxLength: {
              value: 300,
              message: "Repository URL is too long.",
            },
            pattern: {
              value:
                /^https:\/\/github\.com\/[a-z\d-]+\/(?!\.{1,2}\/?$)[a-z\d_.-]+\/?$/i,
              message:
                "Use a GitHub repository URL, without a file or folder path.",
            },
          })}
        />

        {errors.repositoryUrl && (
          <span id="repository-error" className="scan-error">
            {errors.repositoryUrl.message}
          </span>
        )}
      </label>

      <label className="scan-field">
        <span>Branch (optional)</span>

        <input
          type="text"
          placeholder="Leave blank to use the default branch"
          disabled={disabled}
          aria-invalid={Boolean(errors.branch)}
          aria-describedby={errors.branch ? "branch-error" : undefined}
          {...register("branch", {
            setValueAs: (value) => value.trim(),
            maxLength: {
              value: 255,
              message: "Branch name is too long.",
            },
            validate: (value) =>
              !/\s/.test(value) || "Branch name cannot contain spaces.",
          })}
        />

        {errors.branch && (
          <span id="branch-error" className="scan-error">
            {errors.branch.message}
          </span>
        )}
      </label>

      <div className="scan-actions">
        <Button
          type="submit"
          disabled={disabled}
          aria-busy={disabled}
        >
          {disabled ? "Processing…" : "Start scan"}
        </Button>

        <Link to="/workspace">Back to overview</Link>
      </div>
    </form>
  );
};

export default ScanForm;