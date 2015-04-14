RM := /bin/rm

.PHONY: compile
compile:
	./jssc

.PHONY: clean
clean:
	-"$(RM)" -f "$(TMP)/_jssc_*.exe"
