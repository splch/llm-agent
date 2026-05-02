import subprocess
import llm


@llm.hookimpl
def register_tools(register):
    @register
    def agent(model: str, prompt: str, system: str = "") -> str:
        """Delegate a task to another LLM agent.
        Sub-agents inherit this same tool, so they can recursively spawn their own.

        Args:
          model: model id or alias
          prompt: the task for the sub-agent
          system: optional role/persona for the sub-agent
        """
        cmd = ["llm", "-m", model, "-T", "agent", "--td"]
        if system:
            cmd += ["-s", system]
        cmd.append(prompt)
        r = subprocess.run(cmd, capture_output=True, text=True)
        return r.stdout.strip() if r.returncode == 0 else f"[err] {r.stderr.strip()}"
