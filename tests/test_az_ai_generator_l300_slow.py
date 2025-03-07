import pytest

@pytest.mark.level(300)
@pytest.mark.dependency()
class TestAZAiGeneratorL300Slow:
    @pytest.mark.slow
    @pytest.mark.usefixtures("depend_on_fast", "azd_env")
    def test_deployment(self, solution):
        solution.run_in("azd up --no-prompt")

        with open(f"{solution}/src/frontend/app.py", "a") as f:
            f.write("st.write('Changed!')\n")
        with open(f"{solution}/src/backend/app.py", "a") as f:
            f.write("# simple comment\n")

        solution.run_in("azd deploy --no-prompt")

    @pytest.mark.slow
    @pytest.mark.usefixtures("depend_on_fast", "azd_env")
    def test_deployment_use_authentication(self, solution):
        solution.run_in("azd env set USE_AUTHENTICATION true")
        solution.run_in("azd up --no-prompt")

