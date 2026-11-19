# Virtual environment lives in the project root (same as the original scripts)
VENV_BIN := bin
PYTHON   := $(VENV_BIN)/python3
PACKAGES := uvicorn fastapi requests

all: run

help:
	@echo "Targets:"
	@echo "  make run                              Set up venv if needed and start main.py"
	@echo "  make reset BRANCH=<branch> MODULE=<n> Run reset.py (branch: python, c, shell, web)"
	@echo "  make venv                             Only create the virtual environment"
	@echo "  make clean                            Remove Python cache files"
	@echo "  make fclean                           clean + remove the virtual environment"
	@echo "  make re                               fclean, then reinstall and run"

venv: $(VENV_BIN)/activate

# Only runs when bin/activate doesn't exist yet
$(VENV_BIN)/activate:
	@echo "Setting up virtual environment..."
	python3 -m venv .
	$(PYTHON) -m pip install $(PACKAGES)

run: venv
	@echo "Starting application..."
	$(PYTHON) main.py

reset: venv
	@if [ -z "$(BRANCH)" ] || [ -z "$(MODULE)" ]; then \
		echo "Missing arguments. Use it like this:"; \
		echo "make reset BRANCH=<python|c|shell|web> MODULE=<int>"; \
		exit 1; \
	fi
	$(PYTHON) reset.py $(BRANCH) $(MODULE)

clean:
	find . -path ./lib -prune -o -type d -name "__pycache__" -exec rm -rf {} +

fclean: clean
	rm -rf bin include lib lib64 pyvenv.cfg

re:
	$(MAKE) fclean
	$(MAKE) all

.PHONY: all venv run reset clean fclean re help
